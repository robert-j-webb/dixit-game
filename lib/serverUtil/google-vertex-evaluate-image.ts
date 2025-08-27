import { generateText } from "ai";
import { vertex } from "./google-vertex-generate-image";
import { returnWrapResponse } from "./amazon-bedrock-evaluate-image";

export async function googleVertexEvaluateImage({
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
  const base64Data = Buffer.from(
    imageBase64.replace(/^data:image\/[a-z]+;base64,/, ""),
    "base64"
  );
  const response = await generateText({
    model: vertex(model),

    messages: [
      {
        role: "system",
        content: `Reply with this schema: ${JSON.stringify(jsonSchema)}`,
      },
      {
        role: "user",
        content: [
          {
            type: "image",
            image: base64Data,
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });
  const answer = JSON.parse(
    response.text.replace(/^```json\n/, "").replace(/\n```$/, "")
  );
  return returnWrapResponse(answer.score, answer.reasoning);
}
