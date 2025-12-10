import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Era, SimulationState, HistoricalEvent, MapLocation, Perspective, LocalNPC } from '../types';

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

// 1. Initialize "Day in the Life" + Map + Perspectives
export const startSimulation = async (era: string): Promise<{ simState: SimulationState, mapLocations: MapLocation[], perspectives: Perspective[] }> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      role: { type: Type.STRING, description: "A specific historical role (e.g., Fishmonger, Scribe, Gladiator)" },
      objective: { type: Type.STRING, description: "A specific goal for the day" },
      inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
      gold: { type: Type.NUMBER },
      health: { type: Type.NUMBER },
      timeOfDay: { type: Type.STRING },
      mapLocations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            x: { type: Type.NUMBER, description: "X coordinate percentage (10-90)" },
            y: { type: Type.NUMBER, description: "Y coordinate percentage (10-90)" },
            type: { type: Type.STRING, enum: ['strategic', 'cultural', 'conflict'] },
            description: { type: Type.STRING },
            visualPrompt: { type: Type.STRING, description: "Prompt for a 360-degree panoramic view of this location during a key historical moment." }
          },
          required: ["name", "x", "y", "type", "description", "visualPrompt"]
        }
      },
      perspectives: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['key_figure', 'commoner', 'expert'] },
                content: { type: Type.STRING, description: "A 1-2 sentence quote representing their strong opinion on the current era." }
            },
            required: ["name", "role", "type", "content"]
        }
      }
    },
    required: ["role", "objective", "inventory", "gold", "health", "timeOfDay", "mapLocations", "perspectives"]
  };

  const system = `
    Initialize a historical simulation in ${era}. 
    1. Assign the user a humble role.
    2. Generate 4-5 KEY locations for a city map. 
       - If New York City (September 11, 2001): Must include 'World Trade Center Plaza' (Morning context) and 'Battery Park'. Ensure the tone is respectful and historically accurate.
       - Locations should allow for "Street View" style visualization of historical events.
    3. Generate 3-4 diverse perspectives on this era:
       - 1 Key Historical Figure (e.g., Caesar, Ho Chi Minh).
       - 1-2 Commoners (e.g., Soldier, Merchant, Peasant).
       - 1 Modern Expert/Historian analyzing the period retrospectively.
  `;
  const prompt = `Generate starting state, map, and perspectives for ${era}.`;

  try {
    const data = await getJson(prompt, system, schema);
    
    // Add IDs to map locations
    const mapLocations = data.mapLocations.map((loc: any, i: number) => ({
      ...loc,
      id: `loc-${Date.now()}-${i}`
    }));

    // Add IDs to perspectives
    const perspectives = data.perspectives.map((p: any, i: number) => ({
        ...p,
        id: `persp-${Date.now()}-${i}`
    }));

    return { 
      simState: { 
        isActive: true,
        role: data.role,
        objective: data.objective,
        timeOfDay: data.timeOfDay,
        gold: data.gold,
        health: data.health,
        inventory: data.inventory,
        lastActionResult: undefined
      },
      mapLocations,
      perspectives
    };
  } catch (e) {
    console.error("Start Sim Error", e);
    return {
      simState: {
        isActive: true,
        role: "Traveler",
        objective: "Explore",
        inventory: [],
        gold: 10,
        health: 100,
        timeOfDay: "Dawn"
      },
      mapLocations: [],
      perspectives: []
    };
  }
};

// 2. Scene Navigation & Simulation Loop
export const navigateScene = async (
  era: string,
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
    5. History: Identify 1-2 SPECIFIC historical events that happened near here.
    6. People: Identify 3-4 locals (mixture of classes/roles) currently present in this location.
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
      nearbyCharacters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            activity: { type: Type.STRING, description: "What they are currently doing" },
            videoPrompt: { type: Type.STRING, description: "A detailed prompt to generate a cinematic, photorealistic video of this person performing their daily activity." }
          },
          required: ["name", "role", "activity", "videoPrompt"]
        }
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
    required: ["newLocation", "description", "atmosphere", "confidence", "nearbyCharacters", "simulationUpdate", "historicalEvents"]
  };

  const prompt = `
    Previous Location: ${currentLocation}
    Previous Description: ${lastDescription}
    Current Time: ${simState.timeOfDay}
    Action: ${action}
  `;

  try {
    const result = await getJson(prompt, systemInstruction, responseSchema);
    // Add IDs to events and characters
    if (result.historicalEvents) {
      result.historicalEvents = result.historicalEvents.map((e: any, i: number) => ({
        ...e,
        id: `event-${Date.now()}-${i}`
      }));
    }
    if (result.nearbyCharacters) {
        result.nearbyCharacters = result.nearbyCharacters.map((c: any, i: number) => ({
            ...c,
            id: `npc-${Date.now()}-${i}`
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
      nearbyCharacters: [{ id: 'ghost', name: 'Ghost', role: 'Spirit', activity: 'Fading', videoPrompt: 'Ghost' }],
      simulationUpdate: { goldChange: 0, healthChange: 0, timeOfDay: simState.timeOfDay, actionResultText: "Nothing happened." },
      historicalEvents: []
    };
  }
};

// 3. Image Generation
export const generateSceneImage = async (era: string, description: string, atmosphere: any): Promise<string | null> => {
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
  era: string,
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

// 6. Expert Chat (Factual)
export const chatWithExpert = async (
  era: string,
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string
): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are a world-renowned Historian and Archaeologist specializing in ${era}.
    Your goal is to educate the user with factual precision.
    
    RULES:
    1. Provide detailed, accurate historical context.
    2. Cite archaeological evidence or primary sources where appropriate.
    3. Distinguish clearly between proven fact, strong theory, and pop-culture myth.
    4. You are NOT roleplaying a character from the past; you are a modern expert analyzing it.
    5. Maintain a professional, academic, yet accessible tone.
  `;

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        temperature: 0.7
      },
      history: history
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I apologize, but I cannot verify that information currently.";
  } catch (error) {
    console.error("Expert Chat Error:", error);
    return "The archives are currently inaccessible.";
  }
};

// 7. Generate Map Visual (Panoramic)
export const generateMapVisual = async (era: string, prompt: string): Promise<string | null> => {
    const model = "gemini-2.5-flash-image";
    const fullPrompt = `
      Wide angle panoramic shot, 16:9 aspect ratio.
      Historical reconstruction of ${era}.
      Location: ${prompt}.
      Action: Historical event in progress or daily life.
      Style: Photorealistic, cinematic, immersive, high detail.
      View: Wide establishing shot looking down a street or across a battlefield.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model,
        contents: fullPrompt
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
      console.error("Map Visual Gen Error:", error);
      return null;
    }
  };

// 8. Generate Strategic Map (Top-down)
export const generateStrategicMapImage = async (era: string): Promise<string | null> => {
    const model = "gemini-2.5-flash-image";
    const prompt = `
      Top down historical map of ${era}. 
      Old parchment paper texture, beige and brown tones.
      Cartography style appropriate for the period.
      Bird's eye view of the region or city.
      High detail, no modern elements.
      Weathered edges, ink aesthetics.
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
      console.error("Strategic Map Gen Error:", error);
      return null;
    }
  };

// 9. Generate Custom Historical Event
export const generateCustomEvent = async (era: string, query: string): Promise<HistoricalEvent | null> => {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        date: { type: Type.STRING },
        description: { type: Type.STRING },
        impact: { type: Type.STRING },
        videoPrompt: { type: Type.STRING, description: "Detailed visual prompt for generating a short video of this event. Photorealistic, cinematic." }
      },
      required: ["title", "date", "description", "impact", "videoPrompt"]
    };
  
    const system = `
      You are an expert historian. 
      Create a historical event entry for the user's query: "${query}" in the context of ${era}.
      If the user's query is vague, infer the most likely historical event they mean.
      If it is not relevant to the era, explain the discrepancy in the description but provide the closest match or the event itself if it is famous.
    `;
    const prompt = `Generate event details for: ${query}`;
  
    try {
      const data = await getJson(prompt, system, schema);
      return {
          id: `custom-event-${Date.now()}`,
          title: data.title,
          date: data.date,
          description: data.description,
          impact: data.impact,
          videoPrompt: data.videoPrompt
      };
    } catch (e) {
      console.error("Custom Event Gen Error", e);
      return null;
    }
  };