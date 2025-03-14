const OPENAI_API_URL = "https://api.openai.com/v1/responses";

interface UserLocation {
  type: "approximate";
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

interface WebSearchConfig {
  type: "web_search_preview";
  user_location?: UserLocation;
  search_context_size?: "low" | "medium" | "high";
}

export const generateOpenAIResponse = async (
  apiKey: string,
  userPrompt: string,
  systemPrompt: string = "Be precise and concise.",
  userLocation?: UserLocation,
  searchContextSize: "low" | "medium" | "high" = "medium",
  model: string = "gpt-4o"
): Promise<string> => {
  const tools: WebSearchConfig[] = [{
    type: "web_search_preview",
    ...(userLocation && { user_location: userLocation }),
    search_context_size: searchContextSize
  }];

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      tools,
      input: `This is the start of the Developer Prompt.\n\n${systemPrompt}\n\nThis is the Start of the User Prompt\n\n${userPrompt}`
    }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to generate OpenAI response: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
  }

  const data = await response.json();

  const messageItem = data.output.find((item: any) => item.type === "message");

  if (!messageItem) {
    throw new Error("Invalid response format from OpenAI: no message type found");
  }

  const outputTextItem = messageItem.content.find((c: any) => c.type === "output_text");

  if (!outputTextItem || !outputTextItem.text) {
    throw new Error("Invalid response format from OpenAI: no output_text found");
  }

  const annotations = outputTextItem.annotations || [];

  // Format citations
  let formattedResponse = outputTextItem.text;

  if (annotations.length) {
    const citationText = annotations
      .map((annotation: any, idx: number) => `\n\n[${idx + 1}] ${annotation.url}`)
      .join("\n");

    formattedResponse += `\n\n###Sources:\n${citationText}`;
  }

  return formattedResponse;
};
