import Together from "together-ai";

export async function togetherEvaluateImage({
  imageUrl,
  prompt,
  model,
  jsonSchema,
}: {
  imageUrl: string;
  prompt: string;
  model: string;
  jsonSchema: Record<string, any>;
}) {
  const together = new Together();

  const response = await together.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
    model: model,
    max_tokens: 1024,
    temperature: 0.6,
    response_format: {
      type: "json_object",
      schema: jsonSchema,
    },
  });

  return response;
}
