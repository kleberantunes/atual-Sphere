
import React from 'react';
import { Stream } from '../types';
import VideoPlayer from './VideoPlayer';
import Icon from './Icon';

interface WatchPageProps {
  stream: Stream;
}

const WatchPage: React.FC<WatchPageProps> = ({ stream }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 p-8 max-w-screen-2xl mx-auto">
      <div className="flex-grow">
        <VideoPlayer stream={stream} />
        <div className="mt-4">
          <h1 className="text-3xl font-bold">{stream.title}</h1>
          <div className="flex items-center mt-2">
            <img src={stream.creator.avatarUrl} alt={stream.creator.name} className="w-12 h-12 rounded-full mr-4" />
            <div>
              <p className="font-semibold text-lg">{stream.creator.name}</p>
              <p className="text-sm text-gray-400">1.2M Subscribers</p>
            </div>
            <button className="ml-auto bg-white text-black font-bold py-2 px-4 rounded-full hover:bg-gray-200 transition-colors">Subscribe</button>
          </div>
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-300">{stream.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
                {stream.tags.map(tag => (
                    <span key={tag} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">#{tag}</span>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:w-96 flex-shrink-0">
        <h2 className="text-xl font-bold mb-4">Live Chat</h2>
        <div className="bg-gray-800 rounded-lg h-[600px] p-4 flex flex-col">
            <div className="flex-grow text-gray-400">Chat messages will appear here...</div>
            <input type="text" placeholder="Say something..." className="w-full bg-gray-700 border-gray-600 rounded-md p-2 mt-4 focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
