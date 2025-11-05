
import { GoogleGenAI, Type, Modality, Blob, LiveServerMessage } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface GeneratedMetadata {
  title: string;
  description: string;
  tags: string[];
}

export async function generateStreamMetadata(prompt: string): Promise<GeneratedMetadata> {
  if (!process.env.API_KEY) {
    // Return mock data if API key is not available
    return {
      title: `Generated Title for: ${prompt}`,
      description: `This is a generated description about ${prompt}. It highlights the key aspects and provides an engaging overview for potential viewers.`,
      tags: ['ai generated', 'demo', ...prompt.toLowerCase().split(' ').filter(tag => tag.length > 2)]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a compelling title, a detailed description, and 5 relevant tags for a video about: "${prompt}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, catchy, and SEO-friendly title for the video."
            },
            description: {
              type: Type.STRING,
              description: "A detailed and engaging description for the video, suitable for a YouTube-style platform."
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 5 relevant keywords or tags."
            }
          },
          required: ["title", "description", "tags"],
        },
      },
    });

    const jsonString = response.text;
    const parsedJson = JSON.parse(jsonString);
    return parsedJson as GeneratedMetadata;

  } catch (error) {
    console.error("Error generating metadata with Gemini API:", error);
    throw new Error("Failed to generate AI metadata.");
  }
}

export async function generateMetadataFromVideo(videoBase64: string, mimeType: string): Promise<GeneratedMetadata> {
  if (!process.env.API_KEY) {
    // Return mock data if API key is not available
    return {
      title: "Generated Title from Video Analysis",
      description: `This is a generated description from analyzing a video. It highlights the key aspects and provides an engaging overview for potential viewers.`,
      tags: ['ai generated', 'video analysis', 'demo']
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { 
        parts: [
          { text: "Analyze the content of this video and generate a compelling title, a detailed description, and 5 relevant tags. Focus on the main subjects, actions, and overall mood of the video." },
          {
            inlineData: {
              data: videoBase64,
              mimeType: mimeType,
            },
          }
        ] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, catchy, and SEO-friendly title for the video based on its content."
            },
            description: {
              type: Type.STRING,
              description: "A detailed and engaging description for the video, summarizing its content."
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 5 relevant keywords or tags based on the video content."
            }
          },
          required: ["title", "description", "tags"],
        },
      },
    });

    const jsonString = response.text;
    const parsedJson = JSON.parse(jsonString);
    return parsedJson as GeneratedMetadata;

  } catch (error) {
    console.error("Error generating metadata from video with Gemini API:", error);
    throw new Error("Failed to generate AI metadata from video.");
  }
}


// --- Audio Encoding/Decoding Helpers ---
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createPcmBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


// --- Gemini Live Session ---
// FIX: `LiveSession` is not an exported member of `@google/genai`. Removed explicit `Promise<LiveSession>` return type and `async` keyword, allowing TypeScript to infer the correct return type from `ai.live.connect`.
export function startTranslationSession(
    targetLanguage: string,
    callbacks: {
        onopen: () => void;
        onmessage: (message: LiveServerMessage) => void;
        onerror: (e: ErrorEvent) => void;
        onclose: (e: CloseEvent) => void;
    }
) {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set. AI features will not work.");
    }
    // Re-instantiate ai object to ensure latest API key is used
    const sessionAi = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    return sessionAi.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: `You are a real-time translator. Transcribe the incoming English audio, translate it to ${targetLanguage}, and then speak the translation. Be concise and accurate. Do not add any commentary.`,
        },
    });
}
