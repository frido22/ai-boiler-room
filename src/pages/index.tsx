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
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setRecordedAudioUrl(url);
    // Wait a short moment for the audio to be properly saved
    setTimeout(() => {
      handleGenerateMix();
    }, 500);
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

    const basePrompt = `Create a ${mood}. The track should be ${speed}. Additionally, ${experimental}. Make it cohesive and danceable while maintaining the dark techno aesthetic. Make the clip loopable so that the end of the clip matches the begining to ensure that it has a strong rhythmic foundation.`;

    // Add inspiration note if audio is present
    if (audioBlob) {
      return `${basePrompt} Use the provided audio as inspiration for the mood, energy, and sound design, but create something entirely new and original. Do not directly copy or extend the input audio - instead, create a fresh composition that captures a similar vibe while being its own unique piece.`;
    }

    return basePrompt;
  };

  const handleGenerateMix = async () => {
    if (!audioBlob) {
      setError('Please record some audio first');
      return;
    }
    
    if (isGenerating) {
      setError('Generation already in progress...');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      setGenerationProgress('Starting music generation...');

      const startTime = Date.now();
      const stylePrompt = generatePromptFromStyle();
      
      setGenerationProgress('Converting audio and preparing request...');
      console.log('Generating mix with prompt:', stylePrompt);
      
      const result = await generateMix(stylePrompt, audioBlob);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (!result.audioUrl) {
        throw new Error('No audio URL received from generation');
      }

      console.log('Generated audio URL:', result.audioUrl);
      setGeneratedAudioUrl(result.audioUrl);
      setGenerationProgress(`Generation completed in ${duration} seconds!`);
      
      // Clear progress message after a delay
      setTimeout(() => setGenerationProgress(''), 3000);
    } catch (error: any) {
      console.error('Generation failed:', error);
      setError(error.message || 'Failed to generate mix. Please try again.');
      setGenerationProgress('');

      // If there's a stats object in the error, show the duration
      if (error.stats?.duration) {
        setError(prev => `${prev} (Failed after ${error.stats.duration.toFixed(1)} seconds)`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setGeneratedAudioUrl('');
    setAudioBlob(null);
    setError('');
    setRecordedAudioUrl('');
  };

  // Add these state variables after the existing ones
  const [isContinuousGeneration, setIsContinuousGeneration] = useState(false);
  const [nextGeneratedAudioUrl, setNextGeneratedAudioUrl] = useState<string>('');

  // Add this function after handleGenerateMix
  const handleContinuousGeneration = async () => {
    setIsContinuousGeneration(true);
    
    const generateNext = async () => {
      try {
        setGenerationProgress('Generating next segment...');
        const stylePrompt = generatePromptFromStyle();
        const result = await generateMix(stylePrompt, audioBlob);
        
        if (!result.audioUrl) {
          throw new Error('No audio URL received from generation');
        }
        
        setNextGeneratedAudioUrl(result.audioUrl);
      } catch (error: any) {
        console.error('Continuous generation failed:', error);
        setError(error.message || 'Failed to generate next segment');
        setIsContinuousGeneration(false);
      }
    };

    // Start the first generation
    generateNext();
  };
  
  // Add a stop function
  const handleStopContinuous = () => {
    setIsContinuousGeneration(false);
    setNextGeneratedAudioUrl('');
  };

  return (
    <>
      <Head>
        <title>AI Boiler Room</title>
        <meta name="description" content="AI-powered techno music generator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <VideoBackground />

      <Container maxWidth="lg">
        <Box sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          py: 4
        }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
            mb: 4
          }}>
            AI Boiler Room
          </Typography>
          
          <Box sx={{ 
            my: 4,
            bgcolor: 'rgba(0,0,0,0.5)',
            p: 3,
            borderRadius: 2
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
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

          {/* Audio Player */}
          {generatedAudioUrl && (
            <Box sx={{ width: '100%', maxWidth: 800, mb: 4 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Generated Track
              </Typography>
              <AudioPlayer 
                audioUrl={generatedAudioUrl} 
                nextAudioUrl={nextGeneratedAudioUrl}
                autoPlay={true}
                isContinuous={isContinuousGeneration}
                onTrackEnd={() => {
                  // Swap current and next audio
                  setGeneratedAudioUrl(nextGeneratedAudioUrl);
                  setNextGeneratedAudioUrl('');
                  // Generate next segment
                  handleContinuousGeneration();
                }}
              />
            </Box>
          )}

          {/* Record Audio Section */}
          <Box sx={{ width: '100%', maxWidth: 800, mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Record Audio Input
            </Typography>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            {recordedAudioUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                  Recorded Audio
                </Typography>
                <AudioPlayer 
              audioUrl={generatedAudioUrl} 
              nextAudioUrl={nextGeneratedAudioUrl}
              autoPlay={true}
              isContinuous={isContinuousGeneration}
              onTrackEnd={() => {
                // Swap current and next audio
                setGeneratedAudioUrl(nextGeneratedAudioUrl);
                setNextGeneratedAudioUrl('');
                // Generate next segment
                handleContinuousGeneration();
              }}
            />
          </Box>
            )}
          </Box>

          {/* Generate Button */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleGenerateMix}
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={20} /> : null}
              sx={{ 
                py: 1.5,
                px: 4,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate Mix'}
            </Button>

            <Button
              variant="contained"
              onClick={isContinuousGeneration ? handleStopContinuous : handleContinuousGeneration}
              disabled={isGenerating}
              sx={{ 
                py: 1.5,
                px: 4,
                bgcolor: isContinuousGeneration ? 'error.main' : 'success.main',
                '&:hover': {
                  bgcolor: isContinuousGeneration ? 'error.dark' : 'success.dark',
                },
              }}
            >
              {isContinuousGeneration ? 'Stop Continuous' : 'Start Continuous'}
            </Button>

            <Button
              variant="outlined"
              onClick={handleStartOver}
              sx={{ 
                py: 1.5,
                px: 4,
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Start Over
            </Button>
          </Box>

          {/* Error Message */}
          {error && (
            <Typography 
              color="error" 
              sx={{ mt: 2 }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
}
