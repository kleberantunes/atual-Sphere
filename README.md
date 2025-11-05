# Babel Streaming - Multi-Language Streaming Platform

Babel Streaming is a feature-rich, production-ready web platform for live and VOD streaming. Its core innovation is the seamless integration of real-time, multi-language audio selection, empowering creators to reach a global audience. The platform provides dedicated, role-based interfaces for **Creators**, **Interpreters**, and **Viewers**, ensuring a tailored and powerful experience for every user.

This project demonstrates a modern frontend architecture using React, TypeScript, and Tailwind CSS, with advanced features powered by the **Google Gemini API**.

---

## ✨ Key Features

### 🌎 For Viewers
- **Intuitive Browsing**: A clean, modern UI for discovering live streams and VODs.
- **Advanced Video Player**: A custom player with controls for play/pause, seeking, volume, quality/resolution switching, captions, and fullscreen mode.
- **Real-Time Language Selection**: Instantly switch between the original audio and multiple live language interpretation tracks.
- **Live Chat**: Engage with the creator and community in real-time.

### 🎬 For Creators
- **Comprehensive Creator Studio**: A central hub to manage all aspects of your stream.
- **AI-Powered Metadata Generation**:
    - **From Text**: Describe your stream and let the Gemini API generate a compelling title, a detailed description, and relevant tags.
    - **From Video**: Upload a video clip and have the AI analyze its content to automatically generate all necessary metadata.
- **Stream Control**: Simple controls to "Go Live" and "Stop Stream".
- **Ingest & Security**: Access primary/backup RTMP URLs, stream keys, and SRT URLs for broadcasting software.
- **Interpreter Management**: Generate and share unique, secure links for interpreters to join their dedicated console.
- **Embeddable Player**: Generate an `<iframe>` snippet to embed your live stream on any website, with a default language pre-selected.

### 🎙️ For Interpreters
- **Dedicated Interpreter Console**: A professional environment focused on the interpretation task.
- **Low-Latency Program Feed**: Watch the main stream with minimal delay.
- **Seamless Handover**: A simple, one-click control to "Go Live", automatically taking over from your partner interpreter for smooth transitions.
- **Partner Status**: Clear visual indicators showing whether you or your partner is currently live.
- **Audio Health Metrics**: Monitor key metrics like latency, packet loss, and jitter to ensure a high-quality broadcast.
- **Talkback Channel**: A dedicated push-to-talk channel to communicate with the production team (placeholder).

---

## 🤖 AI-Powered Real-Time Translation (Automatic Dubbing)

In addition to human interpreters, Babel Streaming leverages the Gemini API to offer fully automated, real-time audio translation, providing a scalable and cost-effective solution for global content delivery.

### How It Works
This system creates a complete end-to-end pipeline for automatic dubbing:
1.  **Audio Ingest**: The creator's original audio stream is captured in real time.
2.  **Live Transcription**: The audio is streamed to the **Gemini Live API**, which performs highly accurate speech-to-text conversion.
3.  **AI Translation**: The transcribed text is instantly translated by the Gemini model into the viewer's selected target language.
4.  **AI Speech Generation (TTS)**: The translated text is converted back into natural-sounding speech using a Text-to-Speech model.
5.  **Audio Delivery**: The newly generated audio track is streamed to the viewer, synchronized with the original video feed.

### Key Advantages
- **Massive Scalability**: Instantly provide translations for numerous languages without the logistical complexity of coordinating human teams.
- **Cost Efficiency**: Significantly reduce the costs associated with professional interpretation services.
- **24/7 Availability**: Offer translated streams around the clock for any live event or VOD.
- **Global Reach**: Break down language barriers and make your content immediately accessible to a worldwide audience.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`@google/genai`) for content generation and analysis.
- **State Management**: React Hooks (`useState`, `useCallback`, `useContext`)
- **Video Playback**: HTML5 `<video>` and `<audio>` elements.

---

## 📂 Project Structure

The project is organized with a clear separation of concerns:

```
/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable React components (Player, Header, Cards, Pages)
│   ├── services/          # API clients (geminiService.ts)
│   ├── App.tsx            # Main application component with routing & state logic
│   ├── constants.ts       # Mock data and global constants
│   ├── types.ts           # Core TypeScript type definitions
│   └── index.tsx          # Application entry point
├── .env                   # Environment variables (API Key)
├── index.html             # Main HTML file
└── README.md              # You are here!
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser.
- A **Google Gemini API Key**.

### Setup & Running

1.  **Environment Variables**:
    This project requires a Google Gemini API key to power its AI features. The application is designed to read this key from the `process.env.API_KEY` environment variable. Ensure this is configured in your deployment environment.

    *If no API key is present, the AI features will be disabled, and the application will fall back to using mock data.*

2.  **Installation**:
    With the environment set up, install the dependencies:
    ```bash
    npm install
    ```

3.  **Running the Development Server**:
    Start the application:
    ```bash
    npm run start
    ```
    This will open the application in your default browser.

---

## ⚙️ How It Works

### Role-Based Access
The application's entry point in `App.tsx` manages the current user's role. Based on the selected role (Creator, Interpreter, or Viewer), it renders the appropriate top-level component (`CreatorStudio`, `InterpreterConsole`, `HomePage`, etc.), ensuring users only see the interface relevant to them.

### Gemini API Integration (`services/geminiService.ts`)
The service communicates with the Gemini API for two primary tasks:
1.  **Text-to-Metadata**: It sends a text prompt to a Gemini model configured with a specific JSON schema. This forces the model to return a well-structured JSON object containing the `title`, `description`, and `tags`, eliminating the need for fragile string parsing.
2.  **Video-to-Metadata**: It takes a base64-encoded video file and sends it to a multimodal Gemini model. The prompt asks the model to analyze the video's content and return metadata in the same structured JSON format.

### Interpreter Handover
The "live" status of each interpreter is managed in the main `App.tsx` component's state (`liveStream`). When an interpreter in the `InterpreterConsole` clicks "Go Live", a callback function (`handleToggleInterpreterLive`) updates this central state. Because this state is passed down to all components, the change is instantly reflected for viewers on the `WatchPage` and for the other interpreter in their own console. This simulates a real-time handover system.