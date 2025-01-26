import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Allow larger payloads for audio data
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb' // Match OpenAI's limit
    }
  }
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to validate audio MIME type
function isValidAudioType(mimeType: string): boolean {
  const validTypes = ['audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/wav', 'audio/webm'];
  return validTypes.includes(mimeType);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFile: string | null = null;

  try {
    const { audioData, mimeType } = req.body;

    if (!audioData || !mimeType) {
      return res.status(400).json({ error: 'Audio data and MIME type are required' });
    }

    if (!isValidAudioType(mimeType)) {
      return res.status(400).json({ 
        error: 'Invalid audio format. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm' 
      });
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Get file extension from MIME type
    const extension = mimeType.split('/')[1];
    tempFile = path.join(tempDir, `recording-${Date.now()}.${extension}`);

    // Write base64 to file
    const buffer = Buffer.from(audioData.split(',')[1], 'base64');
    fs.writeFileSync(tempFile, buffer);

    console.log('Processing audio file:', {
      type: mimeType,
      size: buffer.length,
      path: tempFile
    });

    // Get detailed transcription with Whisper v2-large (whisper-1)
    console.log('Transcribing with Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFile),
      model: "whisper-1",
      response_format: "verbose_json",  // Get more detailed output
      temperature: 0.2,  // Slightly increase creativity for music description
      language: "en",
      prompt: "This is electronic dance music with beats and rhythms. Focus on describing musical elements like: BPM (beats per minute), kick drums, hi-hats, snares, cymbals, synthesizers, bass lines, melodies, and overall sound texture.",
      timestamp_granularities: ["word", "segment"]  // Get word-level timing
    });

    console.log('Transcription received:', transcription);

    // Extract both text and timing information
    const transcriptionText = transcription.text;
    const segments = transcription.segments || [];
    const words = transcription.words || [];

    // Analyze with GPT-4 using both transcription and timing data
    const analysis = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional music producer analyzing techno music. Focus on these aspects in your analysis:
- Tempo and rhythm patterns (use timing data to estimate BPM)
- Drum elements (kick, hi-hats, snares) and their timing patterns
- Bass and synth sounds, including their characteristics and effects
- Overall energy, groove, and danceability
- Production quality, mix balance, and sound design
- Musical structure and arrangement
Provide specific, technical details in your analysis.`
        },
        {
          role: "user",
          content: `Analyze this techno music recording. Here's what I hear in the audio: 

Transcription: ${transcriptionText}

Audio is divided into ${segments.length} segments with detailed word timing.
${words.length > 0 ? `Contains ${words.length} timestamped words/sounds.` : ''}

Provide a detailed analysis of the musical elements, using any timing patterns to help determine tempo and rhythmic elements.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Return both the detailed transcription and analysis
    res.status(200).json({ 
      analysis: analysis.choices[0].message.content,
      transcription: {
        text: transcriptionText,
        segments: segments,
        words: words
      }
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ 
      error: 'Failed to process audio', 
      details: error.message 
    });
  } finally {
    // Clean up temp file
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
      console.log('Cleaned up temporary file');
    }
  }
}
