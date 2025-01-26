import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, LinearProgress, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const waveformRef = useRef<WaveSurfer>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4a9eff',
      progressColor: '#1e50ff',
      cursorColor: '#ffffff',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 100,
      barGap: 2,
    });

    // Load audio
    wavesurfer.load(audioUrl);

    // Update progress
    wavesurfer.on('audioprocess', () => {
      const currentTime = wavesurfer.getCurrentTime();
      const duration = wavesurfer.getDuration();
      setProgress((currentTime / duration) * 100);
    });

    // Handle finish
    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    // Handle ready state
    wavesurfer.on('ready', () => {
      setIsLoading(false);
    });

    // Handle loading error
    wavesurfer.on('error', (error) => {
      console.error('WaveSurfer error:', error);
      setIsLoading(false);
    });

    waveformRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!waveformRef.current) return;

    if (isPlaying) {
      waveformRef.current.pause();
    } else {
      waveformRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box ref={containerRef} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={togglePlayPause} size="large">
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ flexGrow: 1 }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
