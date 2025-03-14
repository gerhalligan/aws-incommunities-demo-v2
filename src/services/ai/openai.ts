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
      input: userPrompt
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate OpenAI response: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.length || !data.find((item: any) => item.type === "message")) {
    throw new Error("Invalid response format from OpenAI");
  }

  const message = data.find((item: any) => item.type === "message");
  const contentItem = message.content.find((c: any) => c.type === "output_text");
  const annotations = contentItem.annotations || [];

  // Format citations
  let formattedResponse = contentItem.text;

  if (annotations.length) {
    const citationText = annotations
      .map((annotation: any, idx: number) => `[${idx + 1}] ${annotation.url}`)
      .join("\n");

    formattedResponse += `\n\n### Sources:\n${citationText}`;
  }

  return formattedResponse;
};
