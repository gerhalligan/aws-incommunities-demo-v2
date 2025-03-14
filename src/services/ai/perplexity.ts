const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const DEFAULT_API_KEY = "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";

export const generatePerplexityResponse = async (apiKey, userPrompt, systemPrompt = "Be precise and concise.") => {
  console.log("generatePerplexityResponse: Starting request...");
  
  // Use default key if none provided
  const effectiveApiKey = apiKey || DEFAULT_API_KEY;

  // Log API Endpoint and Headers
  console.log("API Endpoint:", PERPLEXITY_API_URL);
  console.log("Request Headers:", {
    "Content-Type": "application/json",
    Authorization: `Bearer ${effectiveApiKey ? "<API Key Present>" : "<Missing API Key>"}`,
  });

  // Construct request body
  const requestBody = {
    model: "sonar-pro", // Adjust model name if needed
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
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
        Authorization: `Bearer ${effectiveApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);

    if (!response.ok) {
      console.log("Response not OK. Attempting to read error response...");
      const errorText = await response.text();
      console.error("Error Response Body:", errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const responseText = await response.text();
    console.log("Raw Response Text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed Response Data:", JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      throw new Error("Failed to parse JSON response. Check the raw response text.");
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid Response Format: Missing 'choices[0].message.content'");
      throw new Error("Invalid response format: Missing 'choices[0].message.content'");
    }

    // Extract and clean response
    const content = data.choices[0].message.content;
    const cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    
    // Extract citations
    const citations = data.citations ? data.citations.map((url, index) => `\n\n[${index + 1}] ${url}`).join("") : "";
    
    // Append citations to the cleaned content
    const finalContent = citations ? `${cleanedContent}\n\n### **Sources:**${citations}` : cleanedContent;
    
    console.log("AI Response Content (cleaned with citations):", finalContent);
    return finalContent;

  } catch (error) {
    console.error("Error processing response:", error);
    throw error;
  }
};
