import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import LoopIcon from '@mui/icons-material/Loop';
import Visualizer from './Visualizer';

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, autoPlay = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      console.log('🎵 Audio loaded:', {
        duration: audio.duration,
        src: audioUrl
      });
    });

    audio.addEventListener('ended', () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    });

    audio.addEventListener('error', (e) => {
      console.error('❌ Audio error:', e);
    });

    // Set initial volume
    audio.volume = volume;
    audio.loop = isLooping;

    // Auto-play if enabled
    if (autoPlay) {
      audio.play().then(() => {
        setIsPlaying(true);
        console.log('▶️ Auto-playing audio');
      }).catch(error => {
        console.error('❌ Auto-play failed:', error);
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
      cancelAnimationFrame(animationRef.current!);
    };
  }, [audioUrl, autoPlay]);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current!);
    } else {
      audioRef.current.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    if (!audioRef.current) return;
    audioRef.current.loop = !isLooping;
    setIsLooping(!isLooping);
  };

  const handleTimeChange = (event: Event, newValue: number | number[]) => {
    if (!audioRef.current) return;
    const time = newValue as number;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (!audioRef.current) return;
    const vol = newValue as number;
    audioRef.current.volume = vol;
    setVolume(vol);
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{
      width: '100%',
      bgcolor: 'rgba(0,0,0,0.3)',
      p: 3,
      borderRadius: 2,
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <Box sx={{ mb: 2, height: 100 }}>
        <Visualizer audioUrl={audioUrl} isPlaying={isPlaying} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        
        <Typography sx={{ color: 'white', minWidth: 45 }}>
          {formatTime(currentTime)}
        </Typography>

        <Slider
          value={currentTime}
          max={duration}
          onChange={handleTimeChange}
          sx={{ color: 'primary.main' }}
        />

        <Typography sx={{ color: 'white', minWidth: 45 }}>
          {formatTime(duration)}
        </Typography>

        <IconButton onClick={toggleLoop} sx={{ 
          color: isLooping ? 'primary.main' : 'white',
        }}>
          <LoopIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
        
        <Slider
          value={isMuted ? 0 : volume}
          max={1}
          step={0.01}
          onChange={handleVolumeChange}
          sx={{ 
            color: 'primary.main',
            width: 100
          }}
        />
      </Box>
    </Box>
  );
};

export default AudioPlayer;
