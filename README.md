# 👋 Welcome to Hack for Infinity – Infinity 2K26!

Hey team! 🎉 Welcome to your dedicated repository for the **Infinity 2K26 Hackathon** organized by the **IEEE Computer Society OUCE Student Chapter**.

This is your team's space to build, commit, and submit your project. Organizers have access to this repo and will review your **commit history** to verify the project was built during hackathon hours — so make sure you're committing regularly throughout the day!

> ⏰ **The repository will be locked at 5:30 PM. No pushes will be accepted after that.**

---

## 📅 Quick Schedule

| Time | Activity |
|------|----------|
| 8:30 – 9:00 AM | Reporting & registration |
| 9:00 – 10:00 AM | Opening briefing & kickoff |
| 10:00 AM – 1:00 PM | Development session |
| 1:00 – 2:00 PM | Lunch break & **Round 1 evaluation** |
| 2:00 – 5:30 PM | Development session & final prep |
| 5:30 – 6:00 PM | **Final judging & presentations** |

---

## ✅ Things to Remember

- Commit your code **frequently** throughout the day
- AI tools (ChatGPT, Copilot, etc.) are allowed — but be ready to **explain your code** to the judges
- Pre-built or plagiarised projects will be **disqualified**
- Bring your laptops, chargers, and any hardware you need
- Include a **project document** in this repo (see required sections below)

---

## 📋 Judging Criteria

Projects will be evaluated on:
- 💡 Innovation and originality
- 🛠️ Technical implementation
- 🌍 Practical impact and usefulness
- 🎨 User experience and design
- 🗣️ Clarity of presentation and explanation

---

---

# 📁 Fill This In — Your Project README

> ✏️ *Replace everything below this line with your own project details*

---

## 🏷️ Project Title

AI Vision Assistant for Accessibility

## 👥 Team Members

| Name | GitHub Username |
|------|----------------|
| S.Sushmitha  | Sushmitha579            |
| A.Meghana  | AnnanamMeghana            |
|I.VijayaSri| VijayaSri214

## ❓ Problem Statement

More than 2.2 billion people worldwide live with vision impairment.
Many everyday tasks such as reading text, identifying objects, or understanding surroundings require assistance from others.

Our project aims to empower visually impaired individuals by providing an AI-based assistant that can analyze images and provide voice-based explanations of the environment.

The system converts visual information into spoken feedback, helping users interact with their surroundings independently.

## 🏗️ System Architecture / Design

🏗️ System Architecture / Design

The system consists of three main components:

1️⃣ Frontend

A React-based interface that handles:

Camera input

Voice commands

User interaction

Displaying system status

2️⃣ Backend

A Node.js server that processes requests from the frontend and sends images to AI services for analysis.

3️⃣ AI Processing

AI services perform:

Image analysis

Scene description

OCR (text recognition)

The processed result is converted into speech output and delivered to the user.

Flow:

User → Camera Capture → Voice Command
        ↓
Frontend (React)
        ↓
Backend API
        ↓
AI Vision Processing
        ↓
Text Result
        ↓
Text-to-Speech Output
        ↓
User hears the response

## 🛠️ Technologies Used

Frontend

React

Vite

Web Speech API

Backend

Node.js

Express.js

AI & Vision

 Gemini / Google Vision API

OCR for text recognition

Other Tools

Git & GitHub

VS Code

## ⭐ Key Features

📷 Real-time Camera Input

🎤 Voice Command Interaction

👁️ AI Scene Description

🔤 Text Reading (OCR)

🔊 Text-to-Speech Output

♿ Accessibility-focused design

## ⚙️ How It Works

The user opens the application and activates the camera.

The user gives a voice command such as:

“Describe the scene”

“Read the text”

The system captures an image from the camera.

The image is sent to the backend server.

AI services analyze the image to detect objects or text.

The system generates a text explanation.

The explanation is converted into speech and played to the user.

This allows visually impaired users to understand their surroundings through audio guidance.

## 🚀 How to Run

*Step-by-step instructions for running your project locally.*

```bash
git clone https://github.com/Hack-for-Infinity/codeVSM.git
cd vision-Wishper-21-main
cd frontend
npm install
cd backend
npm install
node server.js
npm run dev
