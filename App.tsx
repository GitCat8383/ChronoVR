import React, { useState, useEffect } from 'react';
import { Era, GameState, Message, NavigationAction, HistoricalEvent, MapLocation } from './types';
import { startSimulation, navigateScene, generateSceneImage, chatWithNPC, generateHistoricalVideo, generateMapVisual } from './services/geminiService';
import { SceneView } from './components/SceneView';
import { ChatInterface } from './components/ChatInterface';
import { Controls } from './components/Controls';
import { LocationMenu } from './components/LocationMenu';
import { GameHUD } from './components/GameHUD';
import { HistoricalEvents } from './components/HistoricalEvents';
import { MapInterface } from './components/MapInterface';
import { SpatialViewer } from './components/SpatialViewer';
import { Perspectives } from './components/Perspectives';
import { History, Loader2, X } from 'lucide-react';

const INITIAL_STATE: GameState = {
  currentLocation: "City Gates",
  currentDescription: "Loading simulation...",
  imageUrl: null,
  isLoadingImage: false,
  isLoadingText: false,
  npcName: "...",
  npcRole: "...",
  atmosphere: { weather: "Clear", sound: "Silence", smell: "Dust", lighting: "Bright" },
  confidence: { proven: [], likely: [], speculative: [] },
  simulation: { 
      isActive: false, 
      role: "", 
      objective: "", 
      timeOfDay: "", 
      gold: 0, 
      health: 100, 
      inventory: [] 
  },
  showConfidenceLayer: false,
  historicalEvents: [],
  mapLocations: [],
  perspectives: [],
  isGeneratingVideo: false,
  currentVideoEventId: null,
  viewingLocationId: null,
  locationVisuals: {}
};

export default function App() {
  const [era, setEra] = useState<Era>(Era.ANCIENT_ROME);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  // Separate state for playing video to show overlay
  const [activeVideoUri, setActiveVideoUri] = useState<string | null>(null);
  // State for Spatial Viewer (3D Map View)
  const [activeMapLocation, setActiveMapLocation] = useState<MapLocation | null>(null);
  const [isLoadingSpatial, setIsLoadingSpatial] = useState(false);

  // Initialize Game Logic
  const initializeEra = async (selectedEra: Era) => {
    setIsInitializing(true);
    setMessages([]);
    setActiveVideoUri(null);
    setActiveMapLocation(null);
    setGameState(prev => ({ ...prev, locationVisuals: {} })); // Clear visual cache on era change
    
    // 1. Start Simulation (Get Role/Stats + Map Locations + Perspectives)
    const { simState, mapLocations, perspectives } = await startSimulation(selectedEra);
    
    // 2. Get Initial Scene based on Sim State
    setGameState(prev => ({ 
        ...prev, 
        isLoadingText: true,
        simulation: simState,
        mapLocations: mapLocations,
        perspectives: perspectives,
        historicalEvents: [] 
    }));

    const navResult = await navigateScene(
        selectedEra, 
        "City Entrance", 
        `Just arriving in ${selectedEra}`, 
        "Look around",
        simState
    );

    // 3. Update State
    setGameState(prev => ({
        ...prev,
        currentLocation: navResult.newLocation,
        currentDescription: navResult.description,
        npcName: navResult.npcSuggestion.name,
        npcRole: navResult.npcSuggestion.role,
        atmosphere: navResult.atmosphere,
        confidence: navResult.confidence,
        simulation: { ...prev.simulation, ...navResult.simulationUpdate },
        historicalEvents: navResult.historicalEvents || [],
        isLoadingText: false
    }));

    // 4. Generate Image
    updateSceneImage(selectedEra, navResult.description, navResult.atmosphere);
    setIsInitializing(false);
  };

  useEffect(() => {
    initializeEra(era);
  }, [era]);

  const updateSceneImage = async (era: Era, description: string, atmosphere: any) => {
    setGameState(prev => ({ ...prev, isLoadingImage: true }));
    const url = await generateSceneImage(era, description, atmosphere);
    setGameState(prev => ({ 
      ...prev, 
      imageUrl: url, 
      isLoadingImage: false 
    }));
  };

  const handleNavigation = async (action: NavigationAction) => {
    if (gameState.isLoadingText || isInitializing) return;

    setGameState(prev => ({ ...prev, isLoadingText: true }));
    setActiveVideoUri(null);

    // 1. Get new text description & sim update
    const navResult = await navigateScene(
      era, 
      gameState.currentLocation, 
      gameState.currentDescription, 
      action.detail,
      gameState.simulation
    );

    setGameState(prev => ({
      ...prev,
      currentLocation: navResult.newLocation,
      currentDescription: navResult.description,
      npcName: navResult.npcSuggestion.name,
      npcRole: navResult.npcSuggestion.role,
      atmosphere: navResult.atmosphere,
      confidence: navResult.confidence,
      simulation: { 
          ...prev.simulation, 
          ...navResult.simulationUpdate,
          gold: prev.simulation.gold + navResult.simulationUpdate.goldChange,
          health: prev.simulation.health + navResult.simulationUpdate.healthChange,
      },
      historicalEvents: navResult.historicalEvents || [], 
      isLoadingText: false
    }));

    // System message
    if (navResult.simulationUpdate.actionResultText) {
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                sender: 'npc', 
                text: `[SYSTEM] ${navResult.simulationUpdate.actionResultText}`,
                timestamp: new Date()
            }
        ]);
    }

    if (gameState.npcName !== navResult.npcSuggestion.name) {
         setMessages(prev => [
            ...prev,
            {
                id: (Date.now() + 1).toString(),
                sender: 'npc',
                text: `*You see ${navResult.npcSuggestion.name} (${navResult.npcSuggestion.role}) nearby.*`,
                timestamp: new Date()
            }
        ]);
    }

    // 2. Generate new image
    updateSceneImage(era, navResult.description, navResult.atmosphere);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const apiHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    const context = activeVideoUri 
        ? "The user is currently watching a historical reconstruction video." 
        : activeMapLocation 
            ? `The user is visualizing the 3D space of ${activeMapLocation.name}.`
            : "";

    const response = await chatWithNPC(
      era,
      gameState.npcName,
      gameState.npcRole,
      apiHistory,
      text,
      gameState.simulation.role,
      context
    );

    const npcMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'npc',
      text: response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, npcMsg]);
    setIsTyping(false);
  };

  const handlePlayEvent = async (event: HistoricalEvent) => {
    if (event.videoUri) {
        setActiveVideoUri(event.videoUri);
        triggerNPCExplanation(event.title, event.description);
        return;
    }

    setGameState(prev => ({ 
        ...prev, 
        isGeneratingVideo: true, 
        currentVideoEventId: event.id 
    }));

    setMessages(prev => [
        ...prev,
        {
            id: Date.now().toString(),
            sender: 'npc',
            text: `*Starts preparing a visual reconstruction of ${event.title}...* "Give me a moment to recall the details perfectly."`,
            timestamp: new Date()
        }
    ]);

    const videoUri = await generateHistoricalVideo(event.videoPrompt);

    setGameState(prev => {
        const updatedEvents = prev.historicalEvents.map(e => 
            e.id === event.id ? { ...e, videoUri: videoUri || undefined } : e
        );
        return {
            ...prev,
            historicalEvents: updatedEvents,
            isGeneratingVideo: false,
            currentVideoEventId: null
        };
    });

    if (videoUri) {
        setActiveVideoUri(videoUri);
        triggerNPCExplanation(event.title, event.description);
    } else {
         setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                sender: 'npc',
                text: `*Frowns* "My memory is hazy... I cannot show you that vision clearly."`,
                timestamp: new Date()
            }
        ]);
    }
  };

  const handleSelectMapLocation = async (location: MapLocation) => {
      setActiveMapLocation(location);
      
      // Check cache first
      if (gameState.locationVisuals[location.id]) {
          return;
      }

      setIsLoadingSpatial(true);
      const visualUrl = await generateMapVisual(era, location.visualPrompt);
      
      setGameState(prev => ({
          ...prev,
          locationVisuals: {
              ...prev.locationVisuals,
              [location.id]: visualUrl || ''
          }
      }));
      setIsLoadingSpatial(false);
  };

  const triggerNPCExplanation = (title: string, desc: string) => {
     setTimeout(() => {
         setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                sender: 'npc',
                text: `*Gestures to the vision of ${title}* "Behold. ${desc} This moment changed everything..."`,
                timestamp: new Date()
            }
        ]);
     }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-gray-200 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-600 rounded-lg shadow-lg shadow-amber-900/50">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide historical-font">CHRONOS VR</h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Living History Engine</p>
              </div>
            </div>
            {isInitializing && (
                <div className="flex items-center gap-2 text-amber-500 text-sm animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" /> Preparing Simulation...
                </div>
            )}
          </div>
          
          <LocationMenu 
            currentEra={era} 
            onSelectEra={setEra} 
            disabled={gameState.isLoadingText || isInitializing}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Game Stats HUD */}
        <GameHUD state={gameState.simulation} />

        {/* Spatial Map Viewer (3D Modal) */}
        <SpatialViewer 
            location={activeMapLocation}
            imageUrl={activeMapLocation ? gameState.locationVisuals[activeMapLocation.id] : null}
            isLoading={isLoadingSpatial}
            onClose={() => setActiveMapLocation(null)}
        />

        {/* Video Overlay Modal */}
        {activeVideoUri && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
                <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                    <button 
                        onClick={() => setActiveVideoUri(null)}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <video 
                        src={activeVideoUri} 
                        controls 
                        autoPlay 
                        className="w-full aspect-video object-contain"
                    />
                    <div className="p-4 bg-gray-900">
                        <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Historical Archives</p>
                        <p className="text-white text-sm">Now playing reconstruction footage...</p>
                    </div>
                </div>
            </div>
        )}

        {/* Map Interface - Placed below navigation/HUD per request */}
        <section>
             <MapInterface 
                locations={gameState.mapLocations}
                onSelectLocation={handleSelectMapLocation}
                disabled={isInitializing}
                era={era}
            />
        </section>

        {/* Main Visual Viewport */}
        <section>
          <SceneView 
            imageUrl={gameState.imageUrl}
            isLoading={gameState.isLoadingImage || gameState.isLoadingText || isInitializing}
            locationName={gameState.currentLocation}
            description={gameState.currentDescription}
            era={era}
            atmosphere={gameState.atmosphere}
            confidence={gameState.confidence}
            showConfidence={gameState.showConfidenceLayer}
            onToggleConfidence={() => setGameState(prev => ({ ...prev, showConfidenceLayer: !prev.showConfidenceLayer }))}
          />
        </section>

        {/* Interaction Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
          
          {/* Controls & Events - Takes 1 column */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full overflow-y-auto pr-2">
            
            <HistoricalEvents 
                events={gameState.historicalEvents}
                onPlayEvent={handlePlayEvent}
                isGenerating={gameState.isGeneratingVideo}
                currentVideoId={gameState.currentVideoEventId}
                disabled={gameState.isLoadingText || isInitializing}
            />

            <Controls 
              onNavigate={handleNavigation} 
              disabled={gameState.isLoadingText || isInitializing} 
            />
            
            <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
               <h4 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-2">Nearby</h4>
               <p className="text-xl font-bold text-white historical-font mb-1">{gameState.npcName}</p>
               <p className="text-sm text-gray-400 italic">{gameState.npcRole}</p>
            </div>
          </div>

          {/* Chat - Takes 2 columns */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-full">
            <div className="flex-1 min-h-[400px]">
                <ChatInterface 
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    npcName={gameState.npcName}
                    npcRole={gameState.npcRole}
                    isTyping={isTyping}
                />
            </div>
            
            {/* Perspectives Component placed below Chat */}
            <div className="flex-shrink-0">
                <Perspectives perspectives={gameState.perspectives} />
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}