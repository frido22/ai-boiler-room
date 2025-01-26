import { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

// Initialize Replicate with API token
const REPLICATE_API_TOKEN = process.env.NEXT_PUBLIC_REPLICATE_API_KEY;

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

  try {
    const { analysis, audioData } = req.body;
    console.log('Received analysis:', analysis);
    console.log('Received audio data:', audioData ? 'Yes' : 'No');

    if (!analysis) {
      console.error('Analysis is missing from request body:', req.body);
      return res.status(400).json({ error: 'Analysis is required' });
    }

    // Log environment check
    console.log('Environment check:', {
      hasReplicateToken: !!REPLICATE_API_TOKEN,
      tokenLength: REPLICATE_API_TOKEN?.length || 0
    });

    // Create input for music generation
    const input: any = {
      model_version: "melody",
      prompt: `Generate a techno track with these characteristics: ${analysis}. Make it energetic and danceable.`,
      duration: 8,
      temperature: 1,
      continuation: false,
      output_format: "wav",
    };

    // If audio data is provided, add it as input_audio
    if (audioData) {
      input.input_audio = audioData;
      input.continuation = true; // Enable continuation mode when audio input is provided
    }

    console.log('Generated input:', { ...input, input_audio: input.input_audio ? 'Present' : 'Not present' });

    // Run prediction with the new model
    const output = await replicate.run(
      "meta/musicgen:7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906",
      { input }
    );

    console.log('Replicate output:', output);

    if (!output || typeof output !== 'string') {
      console.error('Invalid output from Replicate:', output);
      return res.status(500).json({ error: 'Failed to generate audio' });
    }

    // Return the audio URL
    res.status(200).json({ audioUrl: output });
  } catch (error: any) {
    console.error('Error in generate API:', error);
    res.status(500).json({ error: error.message || 'Failed to generate mix' });
  }
}
