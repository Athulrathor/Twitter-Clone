import React, { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Pause, PlayCircle, PlayIcon, X } from 'lucide-react';
import { Play } from 'next/font/google';

interface AudioPlayerProps {
  verified?: boolean;
  audio: {
    url?: string;
    audioUrl: string;
    duration: number;
    mimeType: string;
  };

  editable?: boolean;

  onRemove?: () => void;
}

const AudioPlayer = ({ verified, audio, editable, onRemove }: AudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);

const [playing, setPlaying] = useState(false);

const [currentTime, setCurrentTime] = useState(0);

const [duration, setDuration] = useState(audio.duration);

const togglePlay = async () => {
  if (!audioRef.current) return;

  if (playing) {
    audioRef.current.pause();
    setPlaying(false);
  } else {
    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch (err) {
      console.error(err);
    }
  }
};

const formatTime = (time: number) => {
    const m = Math.floor(time / 60);

    const s = Math.floor(time % 60);

    return `${m}:${s.toString().padStart(2, "0")}`;
};

  return (
    <div className="rounded-2xl border border-neutral-700">
      <audio
  ref={audioRef}
  src={audio.url}
  preload="metadata"
  onLoadedMetadata={() =>
    setDuration(audioRef.current?.duration || 0)
  }
  onTimeUpdate={() =>
    setCurrentTime(audioRef.current?.currentTime || 0)
  }
  onPause={() => setPlaying(false)}
  onPlay={() => setPlaying(true)}
  onEnded={() => setPlaying(false)}
/>

      {/* controls */}
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-700 bg-neutral-900 p-3">

  <Button
    type="button"
    size="icon"
    variant="secondary"
    className="rounded-full"
    onClick={togglePlay}
  >
    {playing ? (
      <Pause className="h-4 w-4" />
    ) : (
      <PlayIcon className="h-4 w-4 ml-0.5" />
    )}
  </Button>

  <div className="flex-1">
    <input
      type="range"
      min={0}
      max={duration}
      value={currentTime}
      className="w-full"
      onChange={(e) => {
        const value = Number(e.target.value);

        if (!audioRef.current) return;

        audioRef.current.currentTime = value;

        setCurrentTime(value);
      }}
    />

    <div className="mt-1 flex justify-between text-xs text-neutral-400">
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
  </div>

  {editable && (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={onRemove}
    >
      <X className="h-4 w-4" />
    </Button>
  )}
</div>
    </div>
  );
}

export default AudioPlayer;