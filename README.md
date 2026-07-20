## Overview
AI interviewer is an interview practice platform that enables users to practice for job interviews so they can land their dream job sooner.

## Demo Link
- **Live Application Demo**: [Watch AI Interviewer Demo](https://localhost:5173) *(Replace with your deployed live demo or video link)*

## Features
1. **Secure Authentication & Profile Management**: Supabase auth, JWT validation, and profile customization.
2. **Interactive Voice Meeting Room**: In-browser Text-to-Speech (TTS) question reading and Speech-to-Text (STT) voice dictation.
3. **Intelligent Resume Parsing**: Gemini 2.5 Flash Structured Outputs for skill extraction and background matching.
4. **Multi-Agent AI Pipeline**: LangChain LCEL Planner, direct JSON Question Generator, and Answers Evaluator.
5. **Interview History**: View past mock interviews, scores out of 10.0, and detailed feedback summaries.
6. **Realtime Session Updates**: Supabase WebSockets for live status updates.

## Tech Stack
1. **Client Application**: React JS, Ant Design, Tailwind CSS, Web Speech API
2. **Server Application**: FastAPI, UV, Python 3.12
3. **Database**: Supabase PostgreSQL, Supabase Realtime, Supabase Storage
4. **Intelligence Layer**: Gemini API, LangChain

## Setup Guide
1. Clone the repository: `git clone https://github.com/vgrbuilds/ai-interviewer.git`
2. Install server dependencies & run backend:
   ```bash
   cd server
   uv sync
   uvicorn main:app --reload
   ```
3. Install client dependencies & run frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```
4. Enjoy practicing interviews!