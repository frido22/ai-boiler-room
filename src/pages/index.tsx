import { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import AudioRecorder from '../components/AudioRecorder';
import AudioPlayer from '../components/AudioPlayer';
import VideoBackground from '../components/VideoBackground';
import StyleSelector, { StyleOptions } from '../components/StyleSelector';
import { generateMix } from '../utils/api';

export default function Home() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    mood: 'dark',
    speed: 'vibing',
    experimental: 'glitch'
  });

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setError('');
    // Generate mix immediately after recording
    handleGenerateMix();
  };

  const generatePromptFromStyle = () => {
    const moodDescriptions = {
      dark: 'dark and industrial techno with heavy basslines and mechanical sounds',
      very_dark: 'extremely dark ambient techno with ominous atmospheres and deep drones',
      disturbing: 'horror-influenced techno with unsettling sounds and eerie atmospheres'
    };

    const speedDescriptions = {
      vibing: 'moderate tempo around 125 BPM, steady and groovy',
      cool: 'energetic tempo around 130 BPM with driving rhythm',
      speed: 'fast and intense around 140 BPM with relentless energy'
    };

    const experimentalDescriptions = {
      glitch: 'incorporate glitch elements, digital artifacts, and broken beat patterns',
      acid: 'feature acid-style synthesizer lines with squelchy 303-like sounds',
      drone: 'include hypnotic drone elements and layered atmospheric textures',
      noise: 'mix in industrial noise elements and harsh textural sounds',
      abstract: 'use experimental and abstract sound design elements'
    };

    const mood = moodDescriptions[styleOptions.mood as keyof typeof moodDescriptions];
    const speed = speedDescriptions[styleOptions.speed as keyof typeof speedDescriptions];
    const experimental = experimentalDescriptions[styleOptions.experimental as keyof typeof experimentalDescriptions];

    return `Create a ${mood}. The track should be ${speed}. Additionally, ${experimental}. Make it cohesive and danceable while maintaining the dark techno aesthetic.`;
  };

  const handleGenerateMix = async () => {
    if (!audioBlob) return;
    
    setIsGenerating(true);
    setError('');
    setGenerationProgress('Starting music generation...');

    const startTime = Date.now();

    try {
      const stylePrompt = generatePromptFromStyle();
      setGenerationProgress('Sending request to MusicGen...');
      console.log('Generating mix with prompt:', stylePrompt);
      
      const result = await generateMix(stylePrompt, audioBlob);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log('Generated audio URL:', result.audioUrl);
      setGeneratedAudioUrl(result.audioUrl);
      setGenerationProgress(`Generation completed in ${duration} seconds!`);
      
      // Clear progress message after a delay
      setTimeout(() => setGenerationProgress(''), 3000);
    } catch (error) {
      console.error('Generation failed:', error);
      setError('Failed to generate mix. Please try again.');
      setGenerationProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>AI Boiler Room</title>
        <meta name="description" content="AI-powered techno music generator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <VideoBackground />

      <Container maxWidth="md">
        <Box sx={{ 
          my: 4, 
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          zIndex: 1
        }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            AI Boiler Room
          </Typography>
          
          <Box sx={{ 
            my: 4,
            bgcolor: 'rgba(0,0,0,0.5)',
            p: 3,
            borderRadius: 2
          }}>
            <Typography variant="h6" gutterBottom>
              Style Options
            </Typography>
            <StyleSelector 
              value={styleOptions}
              onChange={(newOptions) => {
                setStyleOptions(newOptions);
                if (audioBlob) {
                  handleGenerateMix();
                }
              }}
            />
          </Box>

          <Box sx={{ my: 4 }}>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </Box>

          {isGenerating && (
            <Box sx={{ 
              mt: 4, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <CircularProgress sx={{ color: 'white' }} />
              <Typography variant="body1" sx={{ color: 'white' }}>
                {generationProgress}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                This may take 15-30 seconds...
              </Typography>
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2, bgcolor: 'rgba(0,0,0,0.5)', p: 2, borderRadius: 1 }}>
              {error}
            </Typography>
          )}

          {generatedAudioUrl && (
            <Box sx={{ 
              mt: 4,
              bgcolor: 'rgba(0,0,0,0.5)',
              p: 3,
              borderRadius: 2
            }}>
              <Typography variant="h5" gutterBottom>
                Generated Track
              </Typography>
              <AudioPlayer audioUrl={generatedAudioUrl} loop={true} />
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
}
