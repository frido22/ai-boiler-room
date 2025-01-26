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
    console.log(' Preparing MusicGen input...');
    const input: any = {
      model_version: "melody",
      prompt: stylePrompt,
      duration: 8,
      temperature: 1,
      continuation: false,
      output_format: "wav",
    };

    // If audio data is provided, add it as input_audio but disable continuation
    if (audioData) {
      console.log(' Adding audio input for inspiration...');
      input.input_audio = audioData;
      // Set continuation to false since we want a new track inspired by the input
      input.continuation = false;
    }

    console.log(' Sending request to MusicGen...', {
      modelVersion: input.model_version,
      duration: input.duration,
      temperature: input.temperature,
      continuation: input.continuation,
      hasAudio: !!input.input_audio
    });

    // Run prediction with MusicGen
    const output = await replicate.run(
      "meta/musicgen:7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906",
      { input }
    );

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds

    if (!output) {
      console.error('No output received from MusicGen');
      return res.status(500).json({ 
        error: 'No output received from music generation',
        stats: { duration, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() }
      });
    }

    if (typeof output !== 'string') {
      console.error('Invalid output format from MusicGen:', typeof output);
      return res.status(500).json({ 
        error: 'Invalid output format from music generation',
        stats: { duration, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() }
      });
    }

    if (!output.startsWith('http')) {
      console.error('Invalid URL received from MusicGen');
      return res.status(500).json({ 
        error: 'Invalid URL received from music generation',
        stats: { duration, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() }
      });
    }

    console.log('Generation completed!', {
      duration: `${duration.toFixed(1)} seconds`,
      outputType: typeof output,
      success: true,
      url: output
    });

    // Return the audio URL and generation stats
    res.status(200).json({ 
      audioUrl: output,
      stats: {
        duration: duration,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      }
    });
  } catch (error: any) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.error('Error in generate API:', {
      error: error.message,
      duration: `${duration.toFixed(1)} seconds`,
      stack: error.stack
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
