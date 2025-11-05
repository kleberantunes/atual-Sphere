import React, { useState, useCallback } from 'react';
import { MOCK_LIVE_STREAM } from '../constants';
import { Stream, LanguageTrack } from '../types';
import Icon from './Icon';
import { generateStreamMetadata, generateMetadataFromVideo } from '../services/geminiService';

const IngestField: React.FC<{ label: string; value: string; isSecret?: boolean }> = ({ label, value, isSecret = false }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const displayValue = isSecret && !isVisible ? '••••••••••••••••••••' : value;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={displayValue}
          className="flex-grow bg-gray-700 font-mono text-sm text-gray-300 border-gray-600 rounded-md shadow-sm p-2"
        />
        {isSecret && (
          <button onClick={() => setIsVisible(!isVisible)} className="p-2 bg-gray-600 rounded-md text-gray-300 hover:bg-gray-500" aria-label={isVisible ? 'Hide key' : 'Show key'}>
            <Icon icon={isVisible ? 'eye-slash' : 'eye'} className="w-5 h-5" />
          </button>
        )}
        <button onClick={handleCopy} className={`p-2 rounded-md transition-colors ${isCopied ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`} aria-label={`Copy ${label}`}>
          <Icon icon="copy" className="w-5 h-5" />
        </button>
      </div>
       {isCopied && <p className="text-xs text-green-400 mt-1 absolute">Copied!</p>}
    </div>
  );
};


const CreatorStudio: React.FC = () => {
  const [stream, setStream] = useState<Stream>(MOCK_LIVE_STREAM);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streamStatus, setStreamStatus] = useState<'offline' | 'starting' | 'live'>('offline');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState<boolean>(false);
  const [embedLanguage, setEmbedLanguage] = useState<string>('original');
  const [isEmbedCodeCopied, setIsEmbedCodeCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStream(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateMetadata = useCallback(async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const metadata = await generateStreamMetadata(aiPrompt);
      setStream(prev => ({
        ...prev,
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
      }));
    } catch (error) {
      console.error("Failed to generate metadata", error);
      alert("Error: Could not generate metadata. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  }, [aiPrompt]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setVideoFile(file);
      }
  };

  const handleAnalyzeVideo = useCallback(async () => {
    if (!videoFile) return;
    setIsAnalyzingVideo(true);
    try {
      const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to read file as base64 string.'));
            }
        };
        reader.onerror = error => reject(error);
      });

      const base64Video = await toBase64(videoFile);
      const metadata = await generateMetadataFromVideo(base64Video, videoFile.type);
      
      setStream(prev => ({
        ...prev,
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
      }));
    } catch (error) {
      console.error("Failed to generate metadata from video", error);
      alert("Error: Could not analyze video. Check console for details.");
    } finally {
      setIsAnalyzingVideo(false);
    }
  }, [videoFile]);

  const toggleStream = () => {
    if (streamStatus === 'live') {
        setStreamStatus('offline');
    } else {
        setStreamStatus('starting');
        setTimeout(() => setStreamStatus('live'), 2000);
    }
  }
  
  const embedCode = `<iframe src="https://babelstreaming.example.com/embed/${stream.id}?lang=${embedLanguage}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;

  const handleCopyEmbedCode = () => {
      navigator.clipboard.writeText(embedCode);
      setIsEmbedCodeCopied(true);
      setTimeout(() => setIsEmbedCodeCopied(false), 2000);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Creator Studio</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stream Controls & Preview */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Stream Control</h2>
                <button
                    onClick={toggleStream}
                    className={`w-full py-3 text-lg font-bold rounded-lg transition-colors ${
                        streamStatus === 'live'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {streamStatus === 'live' ? 'Stop Stream' : 'Go Live'}
                </button>
                <div className="mt-4 text-center text-gray-400">
                    Status: <span className={`font-bold ${streamStatus === 'live' ? 'text-red-500' : 'text-gray-400'}`}>{streamStatus.toUpperCase()}</span>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="bg-black aspect-video flex items-center justify-center text-gray-500">
                    {streamStatus === 'live' ? <img src={stream.thumbnailUrl} alt="Live Preview" className="object-cover w-full h-full" /> : 'Stream Preview Offline'}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg truncate">{stream.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                        <span className="flex items-center gap-1"><Icon icon="live" className={`w-4 h-4 ${streamStatus === 'live' ? 'text-red-500' : 'text-gray-600'}`} /> {stream.viewers.toLocaleString()}</span>
                        <span>Bitrate: 2500 kbps</span>
                        <span>FPS: 30</span>
                    </div>
                </div>
            </div>
            
             {stream.ingest && (
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Stream Ingest</h2>
                    <div className="space-y-4">
                    <IngestField label="Primary RTMP URL" value={stream.ingest.primaryRtmp.url} />
                    <IngestField label="Primary Stream Key" value={stream.ingest.primaryRtmp.streamKey} isSecret />
                    <div className="border-t border-gray-700 !my-3"></div>
                    <IngestField label="Backup RTMP URL" value={stream.ingest.backupRtmp.url} />
                    <IngestField label="Backup Stream Key" value={stream.ingest.backupRtmp.streamKey} isSecret />
                     <div className="border-t border-gray-700 !my-3"></div>
                    <IngestField label="SRT URL" value={stream.ingest.srtUrl} />
                    </div>
                </div>
            )}

             <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Icon icon="language" className="w-5 h-5" /> Interpreter Links</h2>
                <div className="space-y-3 text-sm">
                    {stream.audioTracks.map(track => (
                        <div key={track.code}>
                            <h3 className="font-semibold text-gray-300">{track.name}</h3>
                            {track.interpreters.map(interpreter => (
                                <div key={interpreter.id} className="pl-2 mt-1">
                                    <p className="text-gray-400">{interpreter.name}: <button onClick={() => navigator.clipboard.writeText(interpreter.link)} className="text-indigo-400 hover:underline">Copy Link</button></p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Metadata & AI */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Stream Metadata</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
              <input type="text" name="title" id="title" value={stream.title} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
              <textarea name="description" id="description" value={stream.description} onChange={handleInputChange} rows={5} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"></textarea>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                    <select name="category" id="category" value={stream.category} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2">
                        <option>Technology</option>
                        <option>Gaming</option>
                        <option>Travel & Events</option>
                        <option>Education</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="visibility" className="block text-sm font-medium text-gray-300">Visibility</label>
                    <select name="visibility" id="visibility" value={stream.visibility} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2">
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                    </select>
                </div>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300">Tags (comma separated)</label>
              <input type="text" name="tags" id="tags" value={stream.tags.join(', ')} onChange={e => setStream(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icon icon="ai" className="w-6 h-6 text-indigo-400" /> Generate with AI</h3>
              
              <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-200">From a Text Description</h4>
                  <p className="text-sm text-gray-400 mb-2">Describe your stream, and let AI create a title, description, and tags for you.</p>
                  <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={3} placeholder="e.g., A live coding session building a real-time chat app with React and Firebase." className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"></textarea>
                  <button
                    onClick={handleGenerateMetadata}
                    disabled={isGenerating || !aiPrompt}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Generating...' : 'Generate from Text'}
                  </button>
              </div>

              <div className="mt-6 bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-200">From Video Content</h4>
                  <p className="text-sm text-gray-400 mb-2">Upload a video, and let AI analyze its content to generate metadata.</p>
                  
                  <div className="flex items-center gap-4">
                      <label htmlFor="video-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600">
                          Choose Video File
                      </label>
                      <input id="video-upload" name="video-upload" type="file" className="sr-only" accept="video/*" onChange={handleFileChange} />
                      {videoFile && <span className="text-sm text-gray-400 truncate">{videoFile.name}</span>}
                  </div>

                  <button
                    onClick={handleAnalyzeVideo}
                    disabled={isAnalyzingVideo || !videoFile}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {isAnalyzingVideo ? 'Analyzing...' : 'Analyze Video'}
                  </button>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icon icon="code-bracket" className="w-6 h-6 text-indigo-400" /> Embed Your Stream</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="embed-lang" className="block text-sm font-medium text-gray-300">Default Language</label>
                        <select 
                            id="embed-lang"
                            value={embedLanguage}
                            onChange={(e) => setEmbedLanguage(e.target.value)}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                        >
                            <option value="original">Original Audio</option>
                            {stream.audioTracks.map(track => (
                            <option key={track.code} value={track.code}>{track.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="embed-code" className="block text-sm font-medium text-gray-300">Embed Code</label>
                        <div className="relative mt-1">
                            <textarea
                                id="embed-code"
                                readOnly
                                value={embedCode}
                                rows={4}
                                className="block w-full bg-gray-900 font-mono text-sm text-gray-300 border-gray-600 rounded-md shadow-sm p-3 pr-24 resize-none"
                            />
                            <button 
                                onClick={handleCopyEmbedCode}
                                className="absolute top-2 right-2 bg-gray-700 hover:bg-indigo-600 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
                                aria-label="Copy embed code"
                            >
                                <Icon icon="copy" className="w-4 h-4" />
                                {isEmbedCodeCopied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-right border-t border-gray-700 pt-4 mt-4">
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 ml-auto">
                    <Icon icon="save" className="w-5 h-5"/>
                    Save Changes
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorStudio;