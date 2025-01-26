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

    // Transcribe with Whisper
    console.log('Transcribing with Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFile),
      model: "whisper-1",
      response_format: "json",
      temperature: 0,
      language: "en"
    });

    console.log('Transcription received:', transcription.text);

    // Analyze with GPT-4
    const analysis = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional music producer analyzing techno music. Provide detailed insights about tempo, rhythm, sound design, arrangement, and mood."
        },
        {
          role: "user",
          content: `Analyze this techno music recording. Here's the transcription: ${transcription.text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    res.status(200).json({ analysis: analysis.choices[0].message.content });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ 
      error: 'Failed to process audio', 
      details: error.message 
    });
  } finally {
    // Clean up temp file
    if (tempFile && fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
        console.log('Cleaned up temporary file');
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
  }
}
