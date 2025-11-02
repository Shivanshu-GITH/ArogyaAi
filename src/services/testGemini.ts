const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export const testGeminiConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Testing Gemini API connection...');
    console.log('API Key present:', !!GOOGLE_API_KEY);
    console.log('API Key length:', GOOGLE_API_KEY?.length);

    if (!GOOGLE_API_KEY) {
      return {
        success: false,
        message: 'API Key is not configured. Please add VITE_GOOGLE_API_KEY to your .env file.'
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: 'Say hello in one word'
        }]
      }]
    };

    console.log('Sending test request to:', url.replace(GOOGLE_API_KEY, 'API_KEY_HIDDEN'));
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = JSON.parse(responseText);
        errorDetails = JSON.stringify(errorData, null, 2);
      } catch {
        errorDetails = responseText;
      }

      return {
        success: false,
        message: `API Error (${response.status}): ${errorDetails}`
      };
    }

    const data = JSON.parse(responseText);
    const responseContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (responseContent) {
      return {
        success: true,
        message: `Connection successful! Gemini responded: "${responseContent}"`
      };
    } else {
      return {
        success: false,
        message: `Unexpected response format: ${responseText}`
      };
    }
  } catch (error) {
    console.error('Test failed with error:', error);
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
