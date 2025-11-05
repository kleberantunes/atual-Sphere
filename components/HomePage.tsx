
import React from 'react';
import { MOCK_LIVE_STREAM, MOCK_SCHEDULED_STREAMS } from '../constants';
import { Stream } from '../types';
import VideoCard from './VideoCard';

interface HomePageProps {
  onSelectVideo: (video: Stream) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelectVideo }) => {
  return (
    <main className="p-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Live Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <VideoCard video={MOCK_LIVE_STREAM} onClick={onSelectVideo} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Scheduled Streams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_SCHEDULED_STREAMS.map(video => (
            <VideoCard key={video.id} video={video} onClick={onSelectVideo} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;