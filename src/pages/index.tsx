import { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import AudioRecorder from '../components/AudioRecorder';
import AudioPlayer from '../components/AudioPlayer';
import { analyzeTrack, generateMix } from '../utils/api';

export default function Home() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setError('');
  };

  const handleAnalyzeTrack = async () => {
    if (!audioBlob) return;
    setIsAnalyzing(true);
    setError('');
    
    try {
      console.log('Starting track analysis...');
      const result = await analyzeTrack(audioBlob);
      setAnalysisResult(result);
      
      // Automatically start generation
      handleGenerateMix(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Failed to analyze track. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateMix = async (analysis: string) => {
    setIsGenerating(true);
    setError('');

    try {
      console.log('Generating mix...');
      const result = await generateMix(analysis);
      setGeneratedAudioUrl(result.audioUrl);
    } catch (error) {
      console.error('Generation failed:', error);
      setError('Failed to generate mix. Please try again.');
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

      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            AI Boiler Room
          </Typography>
          
          <Box sx={{ my: 4 }}>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </Box>

          {audioBlob && (
            <Button 
              variant="contained" 
              onClick={handleAnalyzeTrack}
              disabled={isAnalyzing || isGenerating}
              sx={{ mt: 2 }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Track'}
            </Button>
          )}

          {(isAnalyzing || isGenerating) && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {analysisResult && (
            <Box sx={{ mt: 4, textAlign: 'left' }}>
              <Typography variant="h5" gutterBottom>
                Analysis Result
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {analysisResult}
              </Typography>
            </Box>
          )}

          {generatedAudioUrl && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Generated Track
              </Typography>
              <AudioPlayer audioUrl={generatedAudioUrl} />
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
}
