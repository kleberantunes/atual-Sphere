import React, { useState, useCallback } from 'react';
import { AppView, Stream, User, UserRole } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import WatchPage from './components/WatchPage';
import CreatorStudio from './components/CreatorStudio';
import InterpreterConsole from './components/InterpreterConsole';
import LoginPage from './components/LoginPage';
import { MOCK_LIVE_STREAM, CREATOR_USER, INTERPRETER_USER, VIEWER_USER } from './constants';
import Icon from './components/Icon';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [liveStream, setLiveStream] = useState<Stream>(MOCK_LIVE_STREAM);
  
  const [isSelectingInterpreterSession, setIsSelectingInterpreterSession] = useState(false);
  const [interpreterSession, setInterpreterSession] = useState<{ streamId: string; languageCode: string; interpreterId: string; } | null>(null);

  const handleLogin = useCallback((role: UserRole) => {
    if (role === UserRole.INTERPRETER) {
        setIsSelectingInterpreterSession(true);
        return;
    }
    
    switch(role) {
      case UserRole.CREATOR:
        setCurrentUser(CREATOR_USER);
        break;
      case UserRole.VIEWER:
      default:
        setCurrentUser(VIEWER_USER);
        break;
    }
    setCurrentView(AppView.HOME);
  }, []);
  
  const handleInterpreterLogin = useCallback((session: { streamId: string; languageCode: string; interpreterId: string; }) => {
    const language = liveStream.audioTracks.find(t => t.code === session.languageCode);
    const interpreter = language?.interpreters.find(i => i.id === session.interpreterId);

    if (!interpreter) {
      console.error("Invalid interpreter session selected.");
      setIsSelectingInterpreterSession(false); // Return to role selection
      return;
    }

    // Correctly create the user object for the selected interpreter
    const interpreterUser: User = {
        id: interpreter.id,
        name: interpreter.name,
        avatarUrl: INTERPRETER_USER.avatarUrl, // Using a generic avatar for now
        role: UserRole.INTERPRETER,
    };

    setCurrentUser(interpreterUser);
    setInterpreterSession(session);
    setIsSelectingInterpreterSession(false);
    setCurrentView(AppView.INTERPRETER_CONSOLE);
  }, [liveStream]);
  
  const handleToggleInterpreterLive = useCallback((languageCode: string, interpreterIdToMakeLive: string) => {
      setLiveStream(prevStream => {
          const newStream = { ...prevStream };
          const trackIndex = newStream.audioTracks.findIndex(t => t.code === languageCode);

          if (trackIndex !== -1) {
              const newInterpreters = newStream.audioTracks[trackIndex].interpreters.map(interpreter => {
                  return { ...interpreter, isLive: interpreter.id === interpreterIdToMakeLive };
              }) as [any, any];
              newStream.audioTracks[trackIndex] = { ...newStream.audioTracks[trackIndex], interpreters: newInterpreters };
          }
          return newStream;
      });
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setSelectedStream(null);
    setCurrentView(AppView.HOME);
    setIsSelectingInterpreterSession(false);
    setInterpreterSession(null);
  }, []);

  const handleSelectVideo = useCallback((video: Stream) => {
    setSelectedStream(video);
    setCurrentView(AppView.WATCH);
  }, []);

  const renderView = () => {
    if (!currentUser) return null;

    if (currentView === AppView.CREATOR_STUDIO && currentUser.role !== UserRole.CREATOR) {
        return <HomePage onSelectVideo={handleSelectVideo} />;
    }
    if (currentView === AppView.INTERPRETER_CONSOLE && (currentUser.role !== UserRole.INTERPRETER || !interpreterSession)) {
        return <HomePage onSelectVideo={handleSelectVideo} />;
    }

    switch (currentView) {
      case AppView.WATCH:
        // Use liveStream for the watch page if it's the selected one, to see live interpreter status changes reflected.
        const streamToWatch = selectedStream?.id === liveStream.id ? liveStream : selectedStream;
        return <WatchPage stream={streamToWatch || MOCK_LIVE_STREAM} />;
      case AppView.CREATOR_STUDIO:
        return <CreatorStudio />;
      case AppView.INTERPRETER_CONSOLE:
        return <InterpreterConsole stream={liveStream} session={interpreterSession!} onToggleLive={handleToggleInterpreterLive} />;
      case AppView.HOME:
      default:
        return <HomePage onSelectVideo={handleSelectVideo} />;
    }
  };
  
  const InterpreterSessionSelector = () => (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
          <div className="text-center mb-12 max-w-2xl">
              <Icon icon="language" className="w-16 h-16 text-indigo-500 mx-auto mb-4"/>
              <h1 className="text-5xl font-bold tracking-tighter">Select Your Interpreter Session</h1>
              <p className="text-xl text-gray-400 mt-2">Choose your assigned language and slot to enter the console.</p>
          </div>
          <div className="space-y-6 w-full max-w-md">
              {liveStream.audioTracks.map(track => (
                  <div key={track.code} className="bg-gray-800 p-4 rounded-lg">
                      <h2 className="text-xl font-bold text-center mb-3">{track.name}</h2>
                      <div className="grid grid-cols-2 gap-4">
                          {track.interpreters.map(interpreter => (
                              <button
                                  key={interpreter.id}
                                  onClick={() => handleInterpreterLogin({ streamId: liveStream.id, languageCode: track.code, interpreterId: interpreter.id })}
                                  className="p-4 bg-gray-700 rounded-lg hover:bg-indigo-600 transition-colors duration-200 text-center"
                              >
                                  <span className="font-semibold">{interpreter.name}</span>
                              </button>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
           <button onClick={() => setIsSelectingInterpreterSession(false)} className="mt-8 text-gray-400 hover:text-white">Back to main login</button>
      </div>
  );

  if (!currentUser) {
    if (isSelectingInterpreterSession) {
        return <InterpreterSessionSelector />;
    }
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header user={currentUser} setView={setCurrentView} onLogout={handleLogout} />
      <div className="container mx-auto">
        {renderView()}
      </div>
    </div>
  );
};

export default App;
