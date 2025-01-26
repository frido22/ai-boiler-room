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
    const { analysis } = req.body;

    if (!analysis) {
      return res.status(400).json({ error: 'Analysis is required' });
    }

    // Log environment check
    console.log('Environment check:', {
      hasReplicateToken: !!REPLICATE_API_TOKEN,
      tokenLength: REPLICATE_API_TOKEN?.length || 0
    });

    // Simplify the prompt and keep short duration
    const prompt = "Create a short techno loop with kick drum and hi-hats";
    
    console.log('Starting music generation with prompt:', prompt);

    const input = {
      prompt: prompt,
      model_version: "stereo-large",
      output_format: "mp3",
      duration: 10, // Short duration for testing
      temperature: 0.7,
      top_k: 250,
      top_p: 0.99,
      classifier_free_guidance: 3,
      normalization_strategy: "peak"
    };

    console.log('Sending request to Replicate with input:', input);

    const prediction = await replicate.predictions.create({
      version: "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
      input: input
    });

    console.log('Prediction created:', prediction);

    // Wait for the prediction to complete
    let output = null;
    while (!output) {
      console.log('Checking prediction status...');
      const predictionStatus = await replicate.predictions.get(prediction.id);
      
      if (predictionStatus.status === 'succeeded') {
        output = predictionStatus.output;
        console.log('Generation succeeded:', output);
        break;
      } else if (predictionStatus.status === 'failed') {
        throw new Error(`Prediction failed: ${predictionStatus.error}`);
      }
      
      console.log('Status:', predictionStatus.status);
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Get the audio URL from the output
    const audioUrl = typeof output === 'string' ? output : Array.isArray(output) ? output[0] : null;

    if (!audioUrl) {
      throw new Error('No audio URL in response');
    }

    console.log('Returning audio URL:', audioUrl);
    res.status(200).json({ audioUrl });
  } catch (error: any) {
    console.error('Error in generate API:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    // Specific error for missing API token
    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({ 
        error: 'Replicate API token is not configured. Please add NEXT_PUBLIC_REPLICATE_API_KEY to your environment variables.' 
      });
    }

    // Handle unauthorized error specifically
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid Replicate API token. Please check your NEXT_PUBLIC_REPLICATE_API_KEY environment variable.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate music',
      details: error.message
    });
  }
}
