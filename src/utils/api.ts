/**
 * Client-side API utilities for audio analysis and mix generation
 */

export const analyzeTrack = async (audioBlob: Blob) => {
  console.log('Starting audio analysis...');
  try {
    // Convert blob to base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(audioBlob);
    });

    console.log('Sending audio data:', {
      type: audioBlob.type,
      size: audioBlob.size
    });

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioData: base64,
        mimeType: audioBlob.type
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Analysis failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Analysis completed:', data);
    return data.analysis;

  } catch (error) {
    console.error('Error in analyzeTrack:', error);
    throw error;
  }
};

export const generateMix = async (analysis: string) => {
  console.log('Starting mix generation...');
  try {
    console.log('Sending analysis to generation API:', analysis);
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysis }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Mix generation failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Mix generation completed:', data);
    return data; // Return the full response object which includes audioUrl
  } catch (error) {
    console.error('Error in generateMix:', error);
    throw error;
  }
};
