import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

  useEffect(() => {
    // Initialize WebSocket connection
    ws.current = new WebSocket(`ws://${window.location.hostname}:8000/ws`)


    ws.current.onopen = () => {
      setIsConnected(true)
      console.log('Connected to WebSocket')
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'ai_response') {
        setMessages(prev => [...prev, { type: 'ai', text: data.message }])
        // Here you would typically convert text to speech
        speakText(data.message)
      }
    }

    ws.current.onclose = () => {
      setIsConnected(false)
      console.log('Disconnected from WebSocket')
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')
      
        const response = await fetch('http://127.0.0.1:8000/transcribe/', {
          method: 'POST',
          body: formData
        })
      
        const data = await response.json()
        const transcription = data.transcription || "Sorry, could not transcribe."
      
        setMessages(prev => [...prev, { type: 'user', text: transcription }])
      
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            message: transcription
          }))
        }
      }
      

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="app">
      <h1>Voice Chat with AI</h1>
      <div className="status">
        Connection status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  )
}

export default App 