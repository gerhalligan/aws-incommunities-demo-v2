const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const generateOpenAIResponse =  async (userPrompt, systemPrompt = "Be precise and concise.", apiKey): Promise<string> => {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate OpenAI response: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};