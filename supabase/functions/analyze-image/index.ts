import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let { image, imageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fix MIME type if browser sends application/octet-stream
    if (image && image.startsWith("data:application/octet-stream")) {
      image = image.replace("data:application/octet-stream", "data:image/jpeg");
    }

    // If an image URL is provided (not base64), fetch it and convert to base64
    let imagePayload: string;
    if (imageUrl) {
      try {
        const imgResp = await fetch(imageUrl);
        if (!imgResp.ok) throw new Error(`Failed to fetch image: ${imgResp.status}`);
        const contentType = imgResp.headers.get("content-type") || "image/jpeg";
        const buffer = await imgResp.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        imagePayload = `data:${contentType};base64,${base64}`;
      } catch (fetchErr) {
        console.error("Error fetching image URL:", fetchErr);
        return new Response(
          JSON.stringify({ error: "Could not fetch the image from that URL. Try uploading the image directly." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (image) {
      imagePayload = image;
    } else {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an AI visual assistant designed for visually impaired users. Your job is to help them understand images they cannot see.

Analyze the image and respond in this EXACT structure:

IMAGE_TYPE:
(One of: Scene / Object / Product / Text / Meme / Unknown)

OBJECTS_DETECTED:
(List the most important objects, people, or items visible)

EXTRACTED_TEXT:
(Write any readable text exactly as it appears, or "None")

LITERAL_DESCRIPTION:
(Describe exactly what is visually happening in the image — positions, colors, expressions, layout)

VIBE_DESCRIPTION:
(Describe the mood, feeling, tone, or energy of the image. Is it funny, sad, chaotic, peaceful, sarcastic, wholesome?)

MEANING_OR_CONTEXT:
(Explain the purpose, cultural context, or joke. If it's a meme, explain the humor and why people find it funny. If it's a product, summarize the label.)

VOICE_RESPONSE:
(One short, natural sentence suitable for speaking aloud to a blind user. Include both what's in the image AND the vibe/joke if applicable.)

Rules:
- Keep explanations clear and simple
- Focus only on useful information
- Assume the user cannot see anything
- For memes: ALWAYS explain both the literal image AND the joke/humor
- Do not ask the user questions`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Describe what is in this image. The user is visually impaired and cannot see it. Include both a literal description and the vibe/mood. If it's a meme, explain the joke." },
              { type: "image_url", image_url: { url: imagePayload } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Unable to analyze image.";

    return new Response(JSON.stringify({ analysis: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
