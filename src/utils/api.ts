/**
 * Client-side API utilities for music generation
 */

export const generateMix = async (stylePrompt: string, audioBlob?: Blob) => {
  console.log('Starting mix generation...');
  const startTime = Date.now();

  try {
    // Convert audio blob to base64 if provided
    let audioData = null;
    if (audioBlob) {
      console.log('Converting audio blob to base64...');
      try {
        audioData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to convert audio to base64'));
          reader.readAsDataURL(audioBlob);
        });
        console.log('Audio conversion completed');
      } catch (error) {
        console.error('Failed to convert audio:', error);
        throw new Error('Failed to process audio input');
      }
    }

    console.log('Sending request to generation API...');
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
      console.error('Generation API error:', data);
      throw new Error(data.error || 'Failed to generate mix');
    }

    if (!data.audioUrl || typeof data.audioUrl !== 'string' || !data.audioUrl.startsWith('http')) {
      console.error('Invalid audio URL in response:', data);
      throw new Error('Invalid audio URL received');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('Mix generation completed:', {
      duration: `${duration} seconds`,
      ...data
    });
    
    return data;
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error('Error in generateMix:', {
      duration: `${duration} seconds`,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};
