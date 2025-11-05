
import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { Stream, InterpreterSlot } from '../types';

interface InterpreterConsoleProps {
    stream: Stream;
    session: {
        languageCode: string;
        interpreterId: string;
    };
    onToggleLive: (languageCode: string, interpreterId: string) => void;
}

const HealthMetric: React.FC<{ label: string; value: string; status: 'good' | 'warn' | 'bad' }> = ({ label, value, status }) => {
    const colorClasses = {
        good: 'text-green-400',
        warn: 'text-yellow-400',
        bad: 'text-red-500',
    };
    return (
        <div className="text-center">
            <div className="text-sm text-gray-400">{label}</div>
            <div className={`text-xl font-bold ${colorClasses[status]}`}>{value}</div>
        </div>
    );
}

const InterpreterConsole: React.FC<InterpreterConsoleProps> = ({ stream, session, onToggleLive }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const languageTrack = stream.audioTracks.find(t => t.code === session.languageCode);
    const mySlot = languageTrack?.interpreters.find(i => i.id === session.interpreterId);
    const partnerSlot = languageTrack?.interpreters.find(i => i.id !== session.interpreterId);

    const isLive = mySlot?.isLive || false;
    const isPartnerLive = partnerSlot?.isLive || false;

    useEffect(() => {
        if (isLive) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then(stream => {
                    console.log("Microphone access granted and publishing.");
                })
                .catch(err => {
                    console.error("Could not get microphone access:", err);
                    alert("Microphone access is required to publish audio.");
                });
        }
    }, [isLive]);

    const handleGoLive = () => {
        if (!isLive && mySlot) {
            onToggleLive(session.languageCode, mySlot.id);
        }
    }

    if (!languageTrack || !mySlot || !partnerSlot) {
        return <div className="p-8 text-center text-red-500">Error: Invalid interpreter session.</div>
    }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Interpreter Console</h1>
      <p className="text-lg text-indigo-400 mb-6">{languageTrack.name} ({mySlot.name})</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Program Feed</h2>
           <div className="bg-black aspect-video rounded-lg overflow-hidden">
                <video ref={videoRef} src={stream.videoUrl} muted autoPlay loop className="w-full h-full object-contain" />
           </div>
           <div className="mt-4 bg-gray-700 p-4 rounded-lg flex justify-around items-center">
              <HealthMetric label="Latency" value="85ms" status="good" />
              <HealthMetric label="Packet Loss" value="0.1%" status="good" />
              <HealthMetric label="Jitter" value="5ms" status="good" />
              <HealthMetric label="CPU" value="15%" status="good" />
           </div>
        </div>

        <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
                <h2 className="text-xl font-bold mb-4">Handover Control</h2>
                
                <div className={`p-4 rounded-lg mb-4 ${isPartnerLive ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
                    <div className="text-sm text-gray-300">Partner Status</div>
                    <div className={`text-lg font-bold ${isPartnerLive ? 'text-red-400' : 'text-green-400'}`}>
                        {isPartnerLive ? 'PARTNER IS LIVE' : 'PARTNER IS OFFLINE'}
                    </div>
                </div>

                <button
                    onClick={handleGoLive}
                    disabled={isLive}
                    className={`w-full py-4 text-xl font-bold rounded-lg transition-all duration-300 transform flex items-center justify-center gap-3
                        ${isLive 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
                        }`}
                >
                    <Icon icon={isLive ? 'mic' : 'swap'} className="w-8 h-8"/>
                    {isLive ? 'You are LIVE' : 'Go Live'}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                    {isLive ? "Your partner must take over for you to go offline." : "This will make you the live interpreter for this language."}
                </p>
            </div>

             <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Talkback</h2>
                <p className="text-sm text-gray-400 mb-2">Use this channel to talk to production.</p>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Push to Talk
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InterpreterConsole;