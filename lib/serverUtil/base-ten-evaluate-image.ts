import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.BASETEN_API_KEY,
  baseURL: "https://inference.baseten.co/v1",
});

export async function baseTenEvaluateImage({
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
  console.log(
    "base ten evaluation does not work, they are not multimodal models."
  );
  // Remove data URL prefix if present to get just the base64 data
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

  const response = await client.chat.completions.create({
    model,
    stop: [],
    max_tokens: 1024,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    temperature: 0.6,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "evaluation",
        schema: jsonSchema,
      },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            // THIS DOES NOT WORK!
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
  });

  return response;
}
