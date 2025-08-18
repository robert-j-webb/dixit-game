export async function fireworksEvaluateImage({
  imageBase64,
  prompt,
  model,
  jsonSchema,
}: {
  imageBase64: string;
  prompt: string;
  model: string;
  jsonSchema: Record<string, any>;
}) {
  // Remove data URL prefix if present to get just the base64 data
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

  const apiKey = process.env.FIREWORKS_API_KEY;

  const response = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: `accounts/fireworks/models/${model}`,
        max_tokens: 1024,
        top_p: 1,
        top_k: 40,
        presence_penalty: 0,
        frequency_penalty: 0,
        temperature: 0.6,
        response_format: {
          type: "json_object",
          schema: jsonSchema,
        },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return await response.json();
}
