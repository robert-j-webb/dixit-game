import { amazonBedrockEvaluateImage } from "@/lib/serverUtil/amazon-bedrock-evaluate-image";
import { baseTenEvaluateImage } from "@/lib/serverUtil/base-ten-evaluate-image";
import { fireworksEvaluateImage } from "@/lib/serverUtil/fireworks-evaluate-image";
import { googleVertexEvaluateImage } from "@/lib/serverUtil/google-vertex-evaluate-image";
import { togetherEvaluateImage } from "@/lib/serverUtil/together-evaluate-image";

export async function POST(request: Request) {
  try {
    let { imageUrl, prompt, model, provider } = await request.json();

    if (!prompt || !model || !provider || !imageUrl) {
      return Response.json(
        { error: "Prompt, provider, model and imageUrl is required" },
        { status: 400 }
      );
    }

    const jsonSchema = {
      type: "object",
      properties: {
        reasoning: {
          type: "string",
          description:
            "Detailed reasoning for why this image matches or doesn't match the given prompt, considering artistic style, composition, theme, and suitability for Dixit",
        },
        score: {
          type: "integer",
          minimum: 0,
          maximum: 100,
          description:
            "Numerical score from 0-100 indicating how well the image matches the prompt",
        },
      },
      required: ["reasoning", "score"],
      additionalProperties: false,
    };

    prompt = `Evaluate this image against the prompt: "${prompt}"

Please analyze how well this image matches the given prompt, considering:
- Artistic quality and style suitable for Dixit card game
- How well it represents the key elements mentioned in the prompt
- Creative interpretation and visual appeal
- Overall composition and aesthetics

Return your response as JSON with detailed reasoning and a score from 0-100.`;

    switch (provider) {
      case "fireworks":
        return Response.json(
          await fireworksEvaluateImage({
            imageBase64: imageUrl,
            prompt,
            model,
            jsonSchema,
          })
        );
      case "base-ten":
        return Response.json(
          await baseTenEvaluateImage({
            imageBase64: imageUrl,
            prompt,
            model,
            jsonSchema,
          })
        );
      case "together":
        return Response.json(
          await togetherEvaluateImage({
            imageUrl,
            prompt,
            model,
            jsonSchema,
          })
        );
      case "amazon-bedrock":
        return Response.json(
          await amazonBedrockEvaluateImage({
            imageBase64: imageUrl,
            prompt,
            model,
            jsonSchema,
          })
        );
      case "google-vertex":
        return Response.json(
          await googleVertexEvaluateImage({
            imageBase64: imageUrl,
            prompt,
            model,
            jsonSchema,
          })
        );
      default:
        return Response.json({ error: "Invalid provider" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error evaluating image:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
