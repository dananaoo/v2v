# Voice Chat with AI

A real-time voice chat application that uses WebSocket for communication and Gemini AI for responses.

## Project Structure
```
voicechat/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── App.css
    └── package.json
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- Gemini API key

## Setup

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Create a `.env` file in the backend directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Running the Application

1. Start the backend server (from the backend directory):
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start the frontend development server (from the frontend directory):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Features

- Real-time voice recording
- Speech-to-text conversion
- AI-powered responses using Gemini
- Text-to-speech for AI responses
- WebSocket-based communication
- Simple and intuitive UI

## Note

This is a basic implementation. For production use, you should:
- Implement proper error handling
- Add user authentication
- Use a proper speech-to-text service
- Implement proper security measures
- Add proper logging and monitoring 