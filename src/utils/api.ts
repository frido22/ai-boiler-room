/**
 * Client-side API utilities for music generation
 */

export interface StyleOptions {
  genre: string;
  mood: string;
  speed: string;
  experimental: string;
}

const generateStylePrompt = (options: StyleOptions) => {
  const { genre, mood, speed, experimental } = options;
  
  const prompts = {
    genre: {
      techno: "Create a dark and industrial techno track",
      house: "Create a groovy house track",
      ambient: "Create an atmospheric ambient piece",
      dnb: "Create an energetic drum and bass track",
      experimental: "Create an experimental electronic piece"
    },
    mood: {
      dark: "with a dark and mysterious atmosphere",
      uplifting: "with an uplifting and positive vibe",
      melancholic: "with a melancholic and emotional feel",
      aggressive: "with an aggressive and intense energy",
      chill: "with a relaxed and laid-back mood"
    },
    speed: {
      slow: "at a slow tempo around 80-100 BPM",
      moderate: "at a moderate tempo around 120-130 BPM",
      fast: "at a fast tempo around 140-160 BPM",
      vibing: "with a steady and groovy rhythm",
      varying: "with dynamic tempo changes"
    },
    experimental: {
      minimal: "Keep it minimal and focused.",
      glitch: "Incorporate glitch elements and digital artifacts.",
      textural: "Focus on rich textures and layered sounds.",
      melodic: "Include melodic elements and harmonies.",
      noisy: "Add noise and distortion elements."
    }
  };

  // Combine the prompts
  const prompt = `${prompts.genre[genre]} ${prompts.mood[mood]} ${prompts.speed[speed]}. ${prompts.experimental[experimental]}`;

  // Add audio input context if provided
  const audioContext = ". Use the provided audio as inspiration for the mood, energy, and sound design, but create something entirely new and original. Do not directly copy or extend the input audio - instead, create a fresh composition that captures a similar vibe while being its own unique piece.";

  return prompt + audioContext;
};

export const generateMix = async (styleOptions: StyleOptions, audioBlob?: Blob) => {
  console.log('🚀 Starting mix generation process...', {
    hasAudioInput: !!audioBlob,
    audioSize: audioBlob?.size,
    audioType: audioBlob?.type
  });
  
  const startTime = Date.now();

  try {
    // Generate style prompt from options
    const stylePrompt = generateStylePrompt(styleOptions);
    console.log('Received style prompt:', stylePrompt);

    // Convert audio blob to base64 if provided
    let audioData = null;
    if (audioBlob) {
      console.log('🔄 Converting audio blob to base64...', { 
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
        timestamp: new Date().toISOString()
      });

      try {
        // First read as array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        console.log('✅ Audio converted to ArrayBuffer:', {
          bufferSize: arrayBuffer.byteLength,
          timestamp: new Date().toISOString()
        });

        // Convert to base64
        const base64 = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        audioData = `data:${audioBlob.type};base64,${base64}`;
        
        console.log('✅ Audio conversion completed:', { 
          inputSize: audioBlob.size,
          outputLength: audioData.length,
          mimeType: audioBlob.type,
          base64Prefix: audioData.substring(0, 50) + '...',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Failed to convert audio:', {
          error,
          blobSize: audioBlob.size,
          blobType: audioBlob.type,
          timestamp: new Date().toISOString()
        });
        throw new Error('Failed to process audio input');
      }
    }

    console.log('📤 Sending request to generation API...', {
      hasAudio: !!audioData,
      audioDataLength: audioData?.length,
      promptLength: stylePrompt.length,
      timestamp: new Date().toISOString()
    });

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        stylePrompt,
        audioData
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Generation API error:', {
        status: response.status,
        statusText: response.statusText,
        data,
        timestamp: new Date().toISOString()
      });
      throw new Error(data.error || 'Failed to generate mix');
    }

    if (!data.audioUrl || typeof data.audioUrl !== 'string' || !data.audioUrl.startsWith('http')) {
      console.error('❌ Invalid audio URL in response:', {
        data,
        timestamp: new Date().toISOString()
      });
      throw new Error('Invalid audio URL received');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('✅ Mix generation completed:', {
      duration: `${duration} seconds`,
      audioUrl: data.audioUrl,
      timestamp: new Date().toISOString(),
      ...data
    });
    
    return data;
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error('❌ Error in generateMix:', {
      duration: `${duration} seconds`,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
