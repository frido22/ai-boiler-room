import { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

// Initialize Replicate with API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
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

    console.log('Generating music from analysis:', analysis);

    // Convert analysis to a music generation prompt
    const prompt = `Create a techno track with the following characteristics: ${analysis}. 
                   Make it hypnotic and suitable for a warehouse environment. 
                   Duration should be around 2 minutes.`;

    // Generate music using MusicGen
    const output = await replicate.run(
      "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
      {
        input: {
          model_version: "stereo-large",
          prompt: prompt,
          duration: 120,
          temperature: 0.7,
          output_format: "mp3",
          top_k: 250,
          top_p: 0.99,
          classifier_free_guidance: 3
        }
      }
    );

    console.log('Music generation completed, output:', output);

    // Replicate returns the URL as a string
    const audioUrl = typeof output === 'string' ? output : Array.isArray(output) ? output[0] : null;

    if (!audioUrl) {
      throw new Error('No audio URL in response');
    }

    // Return the URL to the generated audio
    res.status(200).json({ 
      audioUrl,
      prompt
    });

  } catch (error: any) {
    console.error('Error generating music:', error);
    res.status(500).json({ 
      error: 'Failed to generate music', 
      details: error.message 
    });
  }
}
