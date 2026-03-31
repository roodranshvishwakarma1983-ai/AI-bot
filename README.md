# AI Interview Taking Bot

A complete web-based AI interview simulator for college projects and real interview practice.

## Features

- Login/Register with JWT authentication
- Resume upload (`.pdf` / `.docx`)
- Resume parsing + skill extraction
- Interview modes:
  - **Test Mode**: text chat interview
  - **Live Mode**: voice-enabled interview (browser speech APIs)
- AI-generated resume-based interview questions
- AI answer evaluation + running score
- Final performance report with strengths, weaknesses, and suggestions
- Three.js animated landing scene
- Mobile responsive UI

## Tech Stack

### Frontend
- HTML, CSS, Vanilla JavaScript
- Three.js animation
- Web Speech API (for voice mode)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- OpenAI API integration (with fallback mode)

## Project Structure

```bash
AI-bot/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── InterviewSession.js
│   ├── Resume.js
│   └── User.js
├── public/
│   ├── css/styles.css
│   ├── js/main.js
│   ├── js/dashboard.js
│   ├── js/interview.js
│   ├── js/report.js
│   ├── index.html
│   ├── dashboard.html
│   ├── interview.html
│   └── report.html
├── routes/
│   ├── authRoutes.js
│   ├── interviewRoutes.js
│   └── resumeRoutes.js
├── services/
│   ├── aiService.js
│   └── resumeParser.js
├── uploads/
├── server.js
└── package.json
```

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create `.env`
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/ai-interview-bot
   JWT_SECRET=replace_with_secure_secret
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4.1-mini
   ```

3. Start app
   ```bash
   npm run dev
   ```

4. Open in browser
   - `http://localhost:3000`

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Resume
- `POST /api/resume/upload` (auth required, multipart form-data key: `resume`)
- `GET /api/resume/latest` (auth required)

### Interview
- `POST /api/interview/start` with `{ mode: "test" | "live" }`
- `POST /api/interview/answer` with `{ sessionId, question, answer }`
- `GET /api/interview/report/:sessionId`

## Notes

- If `OPENAI_API_KEY` is not set, the app still works with fallback question generation and evaluation logic.
- Voice mode relies on browser support for Speech Recognition / Speech Synthesis.
