import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

// List of video IDs and their types (cartoon or techno)
const VIDEOS = [
  { id: 'SI702KkWrD8', type: 'cartoon' }, // Betty Boop
  { id: 'E__Qk3h18SY', type: 'cartoon' }, // Pink Panther
  { id: 'pmDl_y7dk_U', type: 'techno' },  // Minimal Techno Cartoon
  { id: 'p6x_4q-xaYU', type: 'techno' },  // Boris Brejcha Style
  { id: 'VKio7bKURlc', type: 'techno' }   // Minimal Techno 2023
];

export default function VideoBackground() {
  const [videoId, setVideoId] = useState('');

  useEffect(() => {
    // Randomly select a video
    const randomVideo = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
    setVideoId(randomVideo.id);
  }, []);

  if (!videoId) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none', // Make sure it doesn't interfere with UI interaction
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)', // Dark overlay to make text more readable
        }
      }}
    >
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`}
        title="Background Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{
          width: '100vw',
          height: '100vh',
          transform: 'scale(1.5)', // Slightly zoom in to cover any gaps
          objectFit: 'cover'
        }}
      />
    </Box>
  );
}
