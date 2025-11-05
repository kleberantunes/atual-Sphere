
import React from 'react';
import { Stream } from '../types';
import Icon from './Icon';

interface VideoCardProps {
  video: Stream;
  onClick: (video: Stream) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const formatScheduledTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Use toLocaleString for a more user-friendly format
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onClick(video)}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-800">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {video.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-bold uppercase">
            <Icon icon="live" className="h-3 w-3" />
            Live
          </div>
        )}
      </div>
      <div className="mt-3 flex items-start gap-3">
        <img src={video.creator.avatarUrl} alt={video.creator.name} className="h-9 w-9 rounded-full" />
        <div>
          <h3 className="text-md font-bold text-gray-100 line-clamp-2">{video.title}</h3>
          <p className="text-sm text-gray-400">{video.creator.name}</p>
          {video.scheduledStartTime ? (
            <p className="text-sm text-indigo-400 font-semibold">{formatScheduledTime(video.scheduledStartTime)}</p>
          ) : (
            <p className="text-sm text-gray-400">{video.viewers.toLocaleString()} views</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;