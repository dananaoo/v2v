from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Configure Gemini properly
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            try:
                data = await websocket.receive_text()
                data = json.loads(data)
                user_message = data.get("message", "")

                try:
                    response = model.generate_content(user_message)
                    ai_response = response.text
                    print("Gemini response:", ai_response)
                except Exception as e:
                    print("Gemini error:", e)
                    ai_response = "Sorry, Gemini failed."

                await manager.send_message(json.dumps({
                    "type": "ai_response",
                    "message": ai_response
                }), websocket)
            except Exception as e:
                print("Receive error:", e)
                await manager.send_message(json.dumps({
                    "type": "error",
                    "message": "Invalid input or system error"
                }), websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/transcribe/")
async def transcribe_audio(audio: UploadFile):
    audio_data = await audio.read()

    try:
        response = requests.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}"
            },
            files={
                "file": ("recording.webm", audio_data, "audio/webm"),
                "model": (None, "whisper-1")
            }
        )

        print("Whisper status code:", response.status_code)
        print("Whisper response:", response.json())

        result = response.json()
        return {"transcription": result.get("text", "")}

    except Exception as e:
        print("Transcription error:", e)
        return {"transcription": ""}
