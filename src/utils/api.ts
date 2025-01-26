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
      audioData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      console.log('Audio conversion completed');
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Mix generation failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('Mix generation completed:', {
      duration: `${duration} seconds`,
      ...data
    });
    
    return data;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error('Error in generateMix:', {
      duration: `${duration} seconds`,
      error
    });
    throw error;
  }
};
