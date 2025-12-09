import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Era, SimulationState, HistoricalEvent } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get clean JSON
const getJson = async (prompt: string, systemInstruction: string, schema: Schema) => {
  const model = "gemini-2.5-flash";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7
      }
    });
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini JSON Error", e);
    throw e;
  }
};

// 1. Initialize "Day in the Life"
export const startSimulation = async (era: Era): Promise<SimulationState> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      role: { type: Type.STRING, description: "A specific historical role (e.g., Fishmonger, Scribe, Gladiator)" },
      objective: { type: Type.STRING, description: "A specific goal for the day" },
      inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
      gold: { type: Type.NUMBER },
      health: { type: Type.NUMBER },
      timeOfDay: { type: Type.STRING }
    },
    required: ["role", "objective", "inventory", "gold", "health", "timeOfDay"]
  };

  const system = `Assign the user a humble but interesting role in ${era}. Give them a daily survival objective.`;
  const prompt = `Generate a starting state for a historical simulation.`;

  try {
    const data = await getJson(prompt, system, schema);
    return { ...data, isActive: true };
  } catch (e) {
    return {
      isActive: true,
      role: "Traveler",
      objective: "Explore the city",
      inventory: ["Bread", "Water"],
      gold: 10,
      health: 100,
      timeOfDay: "Dawn"
    };
  }
};

// 2. Scene Navigation & Simulation Loop
export const navigateScene = async (
  era: Era,
  currentLocation: string,
  lastDescription: string,
  action: string,
  simState: SimulationState
) => {
  
  const systemInstruction = `
    You are the Engine for a "Living History" simulation in ${era}.
    Current User Role: ${simState.role}.
    Current Objective: ${simState.objective}.
    
    Update the world based on the user's action: "${action}".
    1. Visuals: Describe the scene vividly.
    2. Atmosphere: Describe sounds, smells, weather, lighting.
    3. Archeology: Categorize visible elements by historical certainty (Proven, Likely, Speculative).
    4. Simulation: Update time, health, gold based on the action.
    5. History: Identify 1-2 SPECIFIC historical events that happened near here or are relevant to this location/era.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      newLocation: { type: Type.STRING },
      description: { type: Type.STRING },
      atmosphere: {
        type: Type.OBJECT,
        properties: {
          weather: { type: Type.STRING },
          sound: { type: Type.STRING },
          smell: { type: Type.STRING },
          lighting: { type: Type.STRING }
        },
        required: ["weather", "sound", "smell", "lighting"]
      },
      confidence: {
        type: Type.OBJECT,
        properties: {
          proven: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Elements backed by hard archaeological evidence" },
          likely: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Expert consensus/speculation" },
          speculative: { type: Type.ARRAY, items: { type: Type.STRING }, description: "AI inventions to fill gaps" }
        },
        required: ["proven", "likely", "speculative"]
      },
      npcSuggestion: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING }
        },
        required: ["name", "role"]
      },
      simulationUpdate: {
        type: Type.OBJECT,
        properties: {
          goldChange: { type: Type.INTEGER },
          healthChange: { type: Type.INTEGER },
          timeOfDay: { type: Type.STRING },
          actionResultText: { type: Type.STRING, description: "Narrative result of the action (e.g. 'You bought an apple for 1 coin')" }
        },
        required: ["goldChange", "healthChange", "timeOfDay", "actionResultText"]
      },
      historicalEvents: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            description: { type: Type.STRING },
            impact: { type: Type.STRING },
            videoPrompt: { type: Type.STRING, description: "Detailed visual prompt for generating a short video of this event. Photorealistic, cinematic." }
          },
          required: ["title", "date", "description", "impact", "videoPrompt"]
        }
      }
    },
    required: ["newLocation", "description", "atmosphere", "confidence", "npcSuggestion", "simulationUpdate", "historicalEvents"]
  };

  const prompt = `
    Previous Location: ${currentLocation}
    Previous Description: ${lastDescription}
    Current Time: ${simState.timeOfDay}
    Action: ${action}
  `;

  try {
    const result = await getJson(prompt, systemInstruction, responseSchema);
    // Add IDs to events
    if (result.historicalEvents) {
      result.historicalEvents = result.historicalEvents.map((e: any, i: number) => ({
        ...e,
        id: `event-${Date.now()}-${i}`
      }));
    }
    return result;
  } catch (error) {
    console.error("Navigation Error:", error);
    // Fallback
    return {
      newLocation: currentLocation,
      description: "The simulation wavers. You remain where you are.",
      atmosphere: { weather: "Hazy", sound: "Static", smell: "Ozone", lighting: "Dim" },
      confidence: { proven: [], likely: [], speculative: ["Everything"] },
      npcSuggestion: { name: "Ghost", role: "Unknown" },
      simulationUpdate: { goldChange: 0, healthChange: 0, timeOfDay: simState.timeOfDay, actionResultText: "Nothing happened." },
      historicalEvents: []
    };
  }
};

// 3. Image Generation
export const generateSceneImage = async (era: Era, description: string, atmosphere: any): Promise<string | null> => {
  const model = "gemini-2.5-flash-image";
  const prompt = `
    First-person view, photorealistic, cinematic lighting, 8k resolution.
    Historical reconstruction of ${era}.
    Scene: ${description}
    Atmosphere: ${atmosphere.weather}, ${atmosphere.lighting}.
    Details: ${atmosphere.sound} (visualized as busy activity if applicable).
    No text overlays.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });
    
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

// 4. Video Generation (Veo)
export const generateHistoricalVideo = async (prompt: string): Promise<string | null> => {
  // Check if API key selection is needed for Veo
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Assuming user selected key, re-instantiate AI with env key is handled by framework usually, 
          // but here we just proceed. The library uses process.env.API_KEY.
      }
  }

  // Need a fresh instance to ensure key is picked up if just selected
  const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let operation = await freshAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Historical reconstruction footage: ${prompt}. Cinematic, photorealistic, 4k.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await freshAi.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        // Fetch with API key appended
        const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoRes.blob();
        return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error("Video Gen Error:", error);
    return null;
  }
};


// 5. NPC Chat (Role Aware)
export const chatWithNPC = async (
  era: Era,
  npcName: string,
  npcRole: string,
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string,
  playerRole: string,
  systemContext: string = "" // Added for passing event context
): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are ${npcName}, a ${npcRole} living in ${era}.
    The user is a ${playerRole}. Address them as such.
    
    RULES:
    1. You ONLY know things from ${era}. Do not know about modern tech or future events.
    2. You have your own daily struggles and biases.
    3. If the user is a lower class than you, be haughty. If higher, be respectful.
    4. Keep responses concise (under 50 words).
    
    CONTEXT: ${systemContext}
  `;

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        temperature: 0.8
      },
      history: history
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "...";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I cannot understand you.";
  }
};