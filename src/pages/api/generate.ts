import { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';
import OpenAI from 'openai';

// Initialize Replicate with API token
const REPLICATE_API_TOKEN = process.env.NEXT_PUBLIC_REPLICATE_API_KEY;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Add token validation
if (!REPLICATE_API_TOKEN) {
  console.error('NEXT_PUBLIC_REPLICATE_API_KEY is not set in environment variables');
}

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN || '',
});

// Function to get audio duration from base64 WebM
async function getAudioDuration(audioData: string): Promise<number> {
  try {
    // Extract the actual base64 data after the data URL prefix
    const base64Data = audioData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // WebM duration is typically stored in the first few bytes
    // For simplicity, we'll estimate 1KB of WebM data ≈ 1 second of audio
    // This is a rough estimation - for more accuracy we'd need to parse the WebM container
    const estimatedDuration = Math.ceil(buffer.length / 1024);
    
    // Ensure minimum duration of 8 seconds and maximum of 30 seconds
    return Math.min(Math.max(estimatedDuration, 8), 30);
  } catch (error) {
    console.error('Error calculating audio duration:', error);
    return 8; // Default to 8 seconds if calculation fails
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  console.log(' Starting music generation process...');

  try {
    const { stylePrompt, audioData } = req.body;
    console.log('Received style prompt:', stylePrompt);
    console.log('Audio input:', audioData ? 'Present' : 'Not present');

    if (!stylePrompt) {
      console.error('Style prompt is missing from request body:', req.body);
      return res.status(400).json({ error: 'Style prompt is required' });
    }

    if (!REPLICATE_API_TOKEN) {
      console.error('Replicate API token is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Log environment check
    console.log('Environment check:', {
      hasReplicateToken: !!REPLICATE_API_TOKEN,
      tokenLength: REPLICATE_API_TOKEN?.length || 0
    });

    console.log('Preparing MusicGen input...', {
      timestamp: new Date().toISOString()
    });

    // Base configuration
    const input: any = {
      model_version: 'stereo-melody-large',
      prompt: stylePrompt,
      duration: 5, // Set initial duration to 5 seconds
      temperature: 1,
      continuation: false,
    };

    // Process audio input if provided
    if (audioData) {
      console.log('Processing audio input...', {
        audioDataLength: audioData.length,
        audioDataPrefix: audioData.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });

      input.input_audio = audioData;
    }

    console.log('Audio input configured:', {
      modelVersion: input.model_version,
      hasAudio: !!audioData,
      continuation: input.continuation,
      audioDataLength: audioData?.length,
      duration: input.duration,
      timestamp: new Date().toISOString()
    });

    console.log('Sending request to MusicGen...', {
      modelVersion: input.model_version,
      duration: input.duration,
      temperature: input.temperature,
      continuation: input.continuation,
      hasAudio: !!audioData,
      audioDataLength: audioData?.length,
      timestamp: new Date().toISOString()
    });

    const output = await replicate.run(
      "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
      { input }
    );

    console.log('MusicGen response received:', {
      outputType: typeof output,
      outputValue: output,
      timestamp: new Date().toISOString()
    });

    // Get audio duration from the output URL
    const audioUrl = output as string;
    
    const endTime = Date.now();
    console.log('Generation completed!', {
      duration: `${((endTime - startTime) / 1000).toFixed(1)} seconds`,
      outputType: typeof output,
      success: true,
      url: audioUrl,
      timestamp: new Date().toISOString()
    });

    // Return the audio URL and generation stats
    return res.status(200).json({ 
      audioUrl,
      stats: {
        duration: (endTime - startTime) / 1000,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        modelVersion: input.model_version,
        hasAudioInput: !!input.input_audio
      }
    });
  } catch (error: any) {
    const endTime = Date.now();
    const generationDuration = (endTime - startTime) / 1000;

    console.error('Error in generate API:', {
      error: error.message,
      duration: `${generationDuration.toFixed(1)} seconds`,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: error.message || 'Failed to generate mix',
      stats: {
        duration: generationDuration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        error: true
      }
    });
  }
}
