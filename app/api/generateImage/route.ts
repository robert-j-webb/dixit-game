import { amazonBedrockGenerateImage } from "@/lib/serverUtil/amazon-bedrock-generate-image";
import { baseTenGenerateImage } from "@/lib/serverUtil/base-ten-generate-image";
import { fireworksGenerateImage } from "@/lib/serverUtil/fireworks-generate-image";
import { googleVertexGenerateImage } from "@/lib/serverUtil/google-vertex-generate-image";
import { togetherGenerateImage } from "@/lib/serverUtil/together-generate-image";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt");
  const model = searchParams.get("model");
  const provider = searchParams.get("provider");

  if (!prompt || prompt.length === 0 || prompt.length > 512) {
    return Response.json(
      { error: "Prompt is required and must be less than 512 characters" },
      { status: 400 }
    );
  }

  if (!model || model.length === 0) {
    return Response.json({ error: "Model is required" }, { status: 400 });
  }

  try {
    switch (provider) {
      case "fireworks":
        return Response.json({
          base64: await fireworksGenerateImage(model, prompt),
        });
      case "together":
        return Response.json({
          url: await togetherGenerateImage(model, prompt),
        });
      case "base-ten":
        return Response.json({
          base64: await baseTenGenerateImage(model, prompt),
        });
      case "amazon-bedrock":
        return Response.json({
          base64: await amazonBedrockGenerateImage(model, prompt),
        });
      case "google-vertex":
        return Response.json({
          base64: await googleVertexGenerateImage(model, prompt),
        });
      default:
        return Response.json({ error: "Invalid provider" }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
