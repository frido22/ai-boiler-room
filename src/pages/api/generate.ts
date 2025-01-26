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

    // Create input for music generation
    console.log(' Preparing MusicGen input...', {
      timestamp: new Date().toISOString()
    });

    const input: any = {
      model_version: "stereo-large", // Default to stereo-large for non-audio generation
      prompt: stylePrompt,
      duration: 8,
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
      const duration = (endTime - startTime) / 1000; // Convert to seconds

      console.log('Generation completed!', {
        duration: `${duration.toFixed(1)} seconds`,
        outputType: typeof output,
        success: true,
        url: output,
        timestamp: new Date().toISOString()
      });

      // Return the audio URL and generation stats
      return res.status(200).json({ 
        audioUrl: output,
        stats: {
          duration: duration,
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
    const duration = (endTime - startTime) / 1000;

    console.error('Error in generate API:', {
      error: error.message,
      duration: `${duration.toFixed(1)} seconds`,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: error.message || 'Failed to generate mix',
      stats: {
        duration: duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        error: true
      }
    });
  }
}
