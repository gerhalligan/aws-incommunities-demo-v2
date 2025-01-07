const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export const generatePerplexityResponse = async (prompt: string, apiKey: string): Promise<string> => {
  console.log("generatePerplexityResponse: Starting request...");

  // Log API Endpoint and Headers
  console.log("API Endpoint:", PERPLEXITY_API_URL);
  console.log("Request Headers:", {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey ? "<API Key Present>" : "<Missing API Key>"}`,
  });

  // Log Request Body
  const requestBody = {
    model: "llama-3.1-sonar-small-128k-online", // Replace with a valid model name
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 5000, // Optional: Add if you want to limit token count
    temperature: 0.2,
    top_p: 0.9,
    top_k: 0,
    stream: false,
    presence_penalty: 0,
    frequency_penalty: 1,
  };
  console.log("Request Body:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Log Response Status and Headers
    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);

    // Log if Response is Not OK
    if (!response.ok) {
      console.log("Response not OK. Attempting to read error response...");
      const errorText = await response.text();
      console.error("Error Response Body:", errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    // Log Raw Response Text
    const responseText = await response.text();
    console.log("Raw Response Text:", responseText);

    // Attempt to Parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed Response Data:", JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      throw new Error("Failed to parse JSON response. Check the raw response text.");
    }

    // Check for Missing or Invalid Fields
    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid Response Format: Missing 'choices[0].message.content'");
      throw new Error("Invalid response format: Missing 'choices[0].message.content'");
    }

    // Return the AI-generated content
    const content = data.choices[0].message.content;
    console.log("AI Response Content:", content);
    return content;

  } catch (error) {
    // Log Catch-All Errors
    console.error("Error processing response:", error);
    throw error;
  }
};
