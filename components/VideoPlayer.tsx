
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stream, Resolution } from '../types';
import Icon from './Icon';
import { AUTO_TRANSLATE_LANGUAGES } from '../constants';
import { startTranslationSession, decodeAudioData, createPcmBlob, decode } from '../services/geminiService';
// FIX: `LiveSession` is not an exported member of `@google/genai`.
// The type has been removed from the import statement.
import { LiveServerMessage } from '@google/genai';

interface VideoPlayerProps {
  stream: Stream;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const lastVolumeRef = useRef<number>(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPanel, setSettingsPanel] = useState<'main' | 'quality' | 'captions'>('main');
  const [selectedQuality, setSelectedQuality] = useState(stream.resolutions?.[0]?.label || 'Auto');
  const [selectedCaption, setSelectedCaption] = useState('off');

  // AI Translation State
  const [autoTranslateLang, setAutoTranslateLang] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  // FIX: Used `ReturnType` to correctly type the session promise ref without importing the non-exported `LiveSession` type.
  const sessionPromiseRef = useRef<ReturnType<typeof startTranslationSession> | null>(null);
  const [liveTranscription, setLiveTranscription] = useState<{input: string; output: string} | null>(null);
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<{ context: AudioContext; gainNode: GainNode; } | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTimeRef = useRef(0);


  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const date = new Date(0);
    date.setSeconds(timeInSeconds);
    const timeString = date.toISOString().substr(11, 8);
    return timeInSeconds >= 3600 ? timeString : timeString.substr(3);
  };

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = time;
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
    
    // If auto-translating, clear the audio buffer
    if (autoTranslateLang && outputAudioContextRef.current) {
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      lastVolumeRef.current = newVolume;
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(lastVolumeRef.current > 0 ? lastVolumeRef.current : 1);
    }
  };
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    setIsFullScreen(!!document.fullscreenElement);
  };
  
  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showSettings) {
        setSettingsPanel('main');
    }
    setShowSettings(prev => !prev);
  }

  const handleQualityChange = (resolution: Resolution) => {
    if (videoRef.current) {
        const currentPlaybackTime = videoRef.current.currentTime;
        const wasPlaying = !videoRef.current.paused;

        videoRef.current.src = resolution.url;
        videoRef.current.load();
        
        const onCanPlay = () => {
            if(videoRef.current) {
                videoRef.current.currentTime = currentPlaybackTime;
                if (wasPlaying) {
                    videoRef.current.play();
                }
                videoRef.current.removeEventListener('canplay', onCanPlay);
            }
        };
        videoRef.current.addEventListener('canplay', onCanPlay);

        setSelectedQuality(resolution.label);
        setShowSettings(false);
        setSettingsPanel('main');
    }
  };

  const handleCaptionChange = (langCode: string) => {
    setSelectedCaption(langCode);
    setShowSettings(false);
    setSettingsPanel('main');
    if (videoRef.current?.textTracks) {
        for (let i = 0; i < videoRef.current.textTracks.length; i++) {
            videoRef.current.textTracks[i].mode = videoRef.current.textTracks[i].language === langCode ? 'showing' : 'hidden';
        }
    }
  }
  
  const handleTrackChange = (value: string) => {
    if (value.startsWith('ai-')) {
        const lang = value.replace('ai-', '');
        setSelectedTrack('');
        setAutoTranslateLang(lang);
    } else {
        setAutoTranslateLang('');
        setSelectedTrack(value);
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    const handleClickOutside = (event: MouseEvent) => {
      const settingsButton = playerContainerRef.current?.querySelector('.settings-button');
      if (settingsButton?.contains(event.target as Node)) return;
        
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettings(false);
        setSettingsPanel('main');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    const audioEl = audioRef.current;
    if (isPlaying) {
      videoRef.current.play();
      if (audioEl && selectedTrack) audioEl.play();
    } else {
      videoRef.current.pause();
      if (audioEl) audioEl.pause();
    }
  }, [isPlaying, selectedTrack]);
  
  useEffect(() => {
    // Volume for human interpreter audio
    if(audioRef.current) {
        audioRef.current.volume = volume;
    }
    // Volume for AI generated audio
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.gainNode.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
    };
    const setVideoDuration = () => setDuration(video.duration);
    const handleVideoEnd = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', setVideoDuration);
    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', setVideoDuration);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, []);
  
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const syncAudio = () => {
      if (video && audio && Math.abs(video.currentTime - audio.currentTime) > 0.2) {
        audio.currentTime = video.currentTime;
      }
    };
    if (video) {
        video.addEventListener('play', syncAudio);
        video.addEventListener('seeking', syncAudio);
    }
    return () => {
      if (video) {
        video.removeEventListener('play', syncAudio);
        video.removeEventListener('seeking', syncAudio);
      }
    };
  }, []);
  
  useEffect(() => {
    if (audioRef.current && videoRef.current && selectedTrack) {
      const placeholderAudioUrl = "https://www.w3schools.com/tags/horse.mp3";
      
      const currentTimeVal = videoRef.current.currentTime;
      audioRef.current.src = placeholderAudioUrl; 
      audioRef.current.load();
      audioRef.current.oncanplay = () => {
          if (audioRef.current) {
            audioRef.current.currentTime = currentTimeVal;
            if (isPlaying) {
              audioRef.current.play();
            }
          }
      }
    } else if (audioRef.current) {
        audioRef.current.src = '';
    }
  }, [selectedTrack, stream.audioTracks, isPlaying]);
  
  // AI Translation Session Effect
  useEffect(() => {
    if (!autoTranslateLang) {
      sessionPromiseRef.current?.then(s => s.close()).catch(e => console.error("Error closing session:", e));
      sessionPromiseRef.current = null;
      return;
    }

    if (!outputAudioContextRef.current) {
      // FIX: Cast window to any to support webkitAudioContext for older browsers without TypeScript errors.
      const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const gainNode = context.createGain();
      gainNode.connect(context.destination);
      outputAudioContextRef.current = { context, gainNode };
    }
    const outputCtx = outputAudioContextRef.current.context;
    
    setIsConnecting(true);
    setLiveTranscription({ input: '', output: '' });

    const sessionPromise = startTranslationSession(
      AUTO_TRANSLATE_LANGUAGES.find(l => l.code === autoTranslateLang)?.name || autoTranslateLang,
      {
        onopen: () => setIsConnecting(false),
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            const { context, gainNode } = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, context.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), context, 24000, 1);
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(gainNode);
            source.addEventListener('ended', () => sourcesRef.current.delete(source));
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }
          let currentInput = '', currentOutput = '';
          if (message.serverContent?.inputTranscription) currentInput = message.serverContent.inputTranscription.text;
          if (message.serverContent?.outputTranscription) currentOutput = message.serverContent.outputTranscription.text;
          if (currentInput || currentOutput) {
            setLiveTranscription(prev => ({ input: (prev?.input || '') + currentInput, output: (prev?.output || '') + currentOutput }));
          }
          if (message.serverContent?.turnComplete) setLiveTranscription({ input: '', output: '' });
        },
        onerror: (e) => {
          console.error("Session error:", e);
          alert("AI translation session failed.");
          setAutoTranslateLang('');
        },
        onclose: () => setIsConnecting(false),
      }
    );
    sessionPromiseRef.current = sessionPromise;

    return () => {
      sessionPromise.then(s => s.close()).catch(e => console.error("Error closing session on cleanup:", e));
      sessionPromiseRef.current = null;
      sourcesRef.current.forEach(source => source.stop());
      sourcesRef.current.clear();
    };
  }, [autoTranslateLang]);

  // Audio Capture Effect
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!autoTranslateLang || !isPlaying || !videoElement) {
      inputAudioContextRef.current?.suspend();
      return;
    }
    if (inputAudioContextRef.current?.state === 'suspended') {
      inputAudioContextRef.current.resume();
      return;
    }
    if (inputAudioContextRef.current) return;
    
    // FIX: Cast window to any to support webkitAudioContext for older browsers without TypeScript errors.
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    inputAudioContextRef.current = inputCtx;
    
    const source = inputCtx.createMediaElementSource(videoElement);
    const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (e) => {
      if (videoElement.paused) return;
      const inputData = e.inputBuffer.getChannelData(0);
      sessionPromiseRef.current?.then((session) => {
        session.sendRealtimeInput({ media: createPcmBlob(inputData) });
      });
    };
    source.connect(scriptProcessor);
    scriptProcessor.connect(inputCtx.destination); // Connect to destination to start processing

    return () => {
      source.disconnect();
      scriptProcessor.disconnect();
      inputCtx.close().then(() => inputAudioContextRef.current = null);
    };
  }, [autoTranslateLang, isPlaying]);


  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div ref={playerContainerRef} className="relative aspect-video w-full group bg-black">
        <video
          ref={videoRef}
          src={stream.videoUrl}
          muted={!!autoTranslateLang}
          className="w-full h-full object-contain"
          onClick={togglePlayPause}
          crossOrigin="anonymous"
        >
            {stream.captionTracks?.map(track => (
                <track 
                    key={track.code}
                    kind="captions"
                    srcLang={track.code}
                    src={track.url}
                    label={track.name}
                    default={selectedCaption === track.code}
                />
            ))}
        </video>
        <audio ref={audioRef} />

        {isConnecting && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20">
            <Icon icon="ai" className="w-12 h-12 mb-4 animate-pulse text-indigo-400" />
            <p className="text-lg">Connecting to AI translation service...</p>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer" onClick={togglePlayPause}>
            {!isPlaying && (
                <button className="text-white bg-black/50 rounded-full p-4" aria-label="Play">
                    <Icon icon="play" className="w-16 h-16"/>
                </button>
            )}
        </div>
        
        {autoTranslateLang && liveTranscription && (
          <div className="absolute bottom-[80px] lg:bottom-20 left-4 right-4 bg-black/60 p-3 rounded-lg text-sm pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
            <p className="text-gray-300"><strong className="text-white">Original:</strong> {liveTranscription.input}</p>
            <p className="text-indigo-300"><strong className="text-white">Translation:</strong> {liveTranscription.output}</p>
          </div>
        )}

        {!stream.isLive && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="video-progress-bar"
                    style={{'--progress-percent': `${progress}%`} as React.CSSProperties}
                    aria-label="Seek slider"
                />
                
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
                            <Icon icon={isPlaying ? 'pause' : 'play'} className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={toggleMute} aria-label={volume === 0 ? 'Unmute' : 'Mute'}>
                                <Icon icon={volume === 0 ? 'volume-off' : 'volume-up'} className="w-6 h-6" />
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/volume:w-24 h-1 rounded-lg appearance-none cursor-pointer transition-all duration-300 volume-slider"
                                style={{'--volume-percent': `${volume * 100}%`} as React.CSSProperties}
                                aria-label="Volume slider"
                            />
                        </div>

                        <span className="text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleSettings} className="settings-button relative z-20" aria-label="Settings">
                            <Icon icon="settings" className="w-6 h-6" />
                        </button>
                       <button onClick={toggleFullScreen} aria-label={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                            <Icon icon={isFullScreen ? 'fullscreen-exit' : 'fullscreen'} className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        )}
        {showSettings && !stream.isLive && (
            <div ref={settingsMenuRef} className="absolute bottom-[70px] right-[20px] w-[280px] bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg z-10 text-white">
                {settingsPanel === 'main' && (
                <div>
                    {stream.captionTracks && stream.captionTracks.length > 0 && (
                    <div onClick={() => setSettingsPanel('captions')} className="flex justify-between items-center p-3 hover:bg-white/10 cursor-pointer">
                        <div className="flex items-center gap-3">
                        <Icon icon="cc" className="w-5 h-5" />
                        <span>Captions</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                        <span>{stream.captionTracks.find(c => c.code === selectedCaption)?.name || 'Off'}</span>
                        <Icon icon="chevron-right" className="w-5 h-5" />
                        </div>
                    </div>
                    )}
                    {stream.resolutions && stream.resolutions.length > 0 && (
                    <div onClick={() => setSettingsPanel('quality')} className="flex justify-between items-center p-3 hover:bg-white/10 cursor-pointer">
                        <div className="flex items-center gap-3">
                        <Icon icon="settings" className="w-5 h-5" />
                        <span>Quality</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                        <span>{selectedQuality}</span>
                        <Icon icon="chevron-right" className="w-5 h-5" />
                        </div>
                    </div>
                    )}
                </div>
                )}
                {settingsPanel === 'captions' && (
                <div>
                    <div onClick={() => setSettingsPanel('main')} className="flex items-center p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                    <Icon icon="chevron-left" className="w-5 h-5" />
                    <span className="ml-3 font-semibold">Captions</span>
                    </div>
                    <div onClick={() => handleCaptionChange('off')} className={`p-3 hover:bg-white/10 cursor-pointer ${selectedCaption === 'off' ? 'text-indigo-400 font-semibold' : ''}`}>Off</div>
                    {stream.captionTracks?.map(track => (
                    <div key={track.code} onClick={() => handleCaptionChange(track.code)} className={`p-3 hover:bg-white/10 cursor-pointer ${selectedCaption === track.code ? 'text-indigo-400 font-semibold' : ''}`}>
                        {track.name}
                    </div>
                    ))}
                </div>
                )}
                {settingsPanel === 'quality' && (
                <div>
                    <div onClick={() => setSettingsPanel('main')} className="flex items-center p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                    <Icon icon="chevron-left" className="w-5 h-5" />
                    <span className="ml-3 font-semibold">Quality</span>
                    </div>
                    {stream.resolutions?.map(res => (
                    <div key={res.label} onClick={() => handleQualityChange(res)} className={`p-3 hover:bg-white/10 cursor-pointer ${selectedQuality === res.label ? 'text-indigo-400 font-semibold' : ''}`}>
                        {res.label}
                    </div>
                    ))}
                </div>
                )}
            </div>
        )}
      </div>
      
      <div className="flex items-center justify-between bg-gray-800 p-4">
        <div className="flex items-center gap-4">
        {stream.isLive && (
            <div className="flex items-center gap-2 text-red-500 font-bold">
            <Icon icon="live" className="h-5 w-5" />
            <span>LIVE</span>
            </div>
        )}
        <div className="flex items-center gap-2 text-gray-300">
            <Icon icon="viewers" className="h-5 w-5" />
            <span>{stream.viewers.toLocaleString()}</span>
        </div>
        </div>
        <div className="relative">
        <Icon icon="language" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <select
            value={autoTranslateLang ? `ai-${autoTranslateLang}` : selectedTrack}
            onChange={(e) => handleTrackChange(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
            aria-label="Select audio language"
        >
            <option value="">Original Audio</option>
            {stream.audioTracks.length > 0 && (
              <optgroup label="Interpreted">
                {stream.audioTracks.map((track) => (
                  <option key={track.code} value={track.code}>
                      {track.name}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="AI Translation (Beta)">
              {AUTO_TRANSLATE_LANGUAGES.map(lang => (
                <option key={lang.code} value={`ai-${lang.code}`}>
                  {lang.name}
                </option>
              ))}
            </optgroup>
        </select>
        </div>
    </div>
    </div>
  );
};

export default VideoPlayer;
