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

    // Calculate duration based on input audio if present
    const duration = audioData ? await getAudioDuration(audioData) : 8;
    console.log('Calculated duration:', duration, 'seconds');

    // Create input for music generation
    console.log(' Preparing MusicGen input...', {
      timestamp: new Date().toISOString()
    });

    const input: any = {
      model_version: "stereo-large", // Default to stereo-large for non-audio generation
      prompt: stylePrompt,
      duration: duration,
      temperature: 1,
      continuation: false,
      output_format: "mp3",
      normalization_strategy: "peak",
      classifier_free_guidance: 3,
      top_k: 250,
      top_p: 0
    };

    // If audio data is provided, switch to stereo-melody-large model
    if (audioData) {
      console.log(' Processing audio input...', {
        audioDataLength: audioData.length,
        audioDataPrefix: audioData.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });
      
      // Ensure we're using the correct model version for audio input
      input.model_version = "stereo-melody-large";
      
      // Add the audio data
      if (!audioData.startsWith('data:')) {
        console.error(' Invalid audio data format', {
          prefix: audioData.substring(0, 20),
          timestamp: new Date().toISOString()
        });
        return res.status(400).json({ error: 'Invalid audio data format' });
      }
      
      input.input_audio = audioData;
      input.continuation = false;
      input.continuation_start = 0;
      
      console.log(' Audio input configured:', {
        modelVersion: input.model_version,
        hasAudio: true,
        continuation: input.continuation,
        audioDataLength: input.input_audio.length,
        duration: duration,
        timestamp: new Date().toISOString()
      });
    }

    console.log(' Sending request to MusicGen...', {
      modelVersion: input.model_version,
      duration: input.duration,
      temperature: input.temperature,
      continuation: input.continuation,
      hasAudio: !!input.input_audio,
      audioDataLength: input.input_audio ? input.input_audio.length : 0,
      timestamp: new Date().toISOString()
    });

    // Run prediction with MusicGen
    try {
      const output = await replicate.run(
        "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
        { input }
      );

      console.log(' MusicGen response received:', {
        outputType: typeof output,
        outputValue: output,
        timestamp: new Date().toISOString()
      });

      if (!output) {
        throw new Error('No output received from MusicGen');
      }

      const endTime = Date.now();
      const generationDuration = (endTime - startTime) / 1000; // Convert to seconds

      console.log('Generation completed!', {
        duration: `${generationDuration.toFixed(1)} seconds`,
        outputType: typeof output,
        success: true,
        url: output,
        timestamp: new Date().toISOString()
      });

      // Return the audio URL and generation stats
      return res.status(200).json({ 
        audioUrl: output,
        stats: {
          duration: generationDuration,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          modelVersion: input.model_version,
          hasAudioInput: !!input.input_audio
        }
      });
    } catch (error: any) {
      console.error(' MusicGen API error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
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
