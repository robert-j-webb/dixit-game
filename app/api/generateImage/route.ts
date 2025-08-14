import { experimental_generateImage as generateImage } from "ai";
import fs from "fs";
import { createFireworks } from "@ai-sdk/fireworks";

const fireworks = createFireworks({
  apiKey: process.env.FIREWORKS_API_KEY ?? "",
});

// Function to convert image to base64
function imageToBase64(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
}

// Check if model is a flux model that requires direct API
function isFluxModel(model: string): boolean {
  return model.includes("flux-kontext") || model.includes("flux-1");
}

// Generate image using direct Fireworks API for flux models
async function generateFluxImage(
  model: string,
  prompt: string,
  inputImage?: string
): Promise<string> {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) {
    throw new Error("FIREWORKS_API_KEY is required");
  }

  const requestBody: any = {
    prompt,
    seed: -1,
    prompt_upsampling: false,
    safety_tolerance: 2,
  };

  // Add input_image if provided
  if (inputImage) {
    requestBody.input_image = inputImage;
  }

  const response = await fetch(
    `https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/${model}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "image/jpeg",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  const result = await response.json();

  if (!result.request_id) {
    throw new Error("Failed to get request_id from Fireworks API");
  }

  console.log("Request submitted with ID:", result.request_id);

  // Poll for completion
  const resultEndpoint = `https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/${model}/get_result`;

  for (let attempts = 0; attempts < 60; attempts++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const resultResponse = await fetch(resultEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "image/jpeg",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ id: result.request_id }),
    });

    if (resultResponse.ok) {
      const pollResult = await resultResponse.json();

      if (["Ready", "Complete", "Finished"].includes(pollResult.status)) {
        const imageData = pollResult.result?.sample;
        if (imageData) {
          if (typeof imageData === "string" && imageData.startsWith("http")) {
            // If it's a URL, fetch the image and convert to buffer
            const imageResponse = await fetch(imageData);
            const imageBuffer = await imageResponse.arrayBuffer();
            return Buffer.from(imageBuffer).toString("base64");
          } else {
            // Base64 image data
            return imageData;
          }
        }
      }

      if (["Failed", "Error"].includes(pollResult.status)) {
        throw new Error(
          `Generation failed: ${pollResult.details || "Unknown error"}`
        );
      }
    }
  }

  throw new Error("Image generation timed out");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt");
  const model = searchParams.get("model");
  const inputImagePath = searchParams.get("inputImage"); // Optional input image path

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
    const filename = `generated/image-${Date.now()}.png`;

    if (isFluxModel(model)) {
      // Use direct Fireworks API for flux models
      let inputImage: string | undefined;

      // Convert input image to base64 if provided
      if (inputImagePath && fs.existsSync(inputImagePath)) {
        const base64Image = imageToBase64(inputImagePath);
        inputImage = `data:image/jpeg;base64,${base64Image}`;
      }

      const base64ImageData = await generateFluxImage(
        model,
        prompt,
        inputImage
      );
      const buffer = Buffer.from(base64ImageData, "base64");

      fs.writeFileSync(`./public/${filename}`, buffer);
    } else {
      // Use existing AI SDK for non-flux models
      const { image } = await generateImage({
        model: fireworks.image(`accounts/fireworks/models/${model}`),
        prompt,
      });

      fs.writeFileSync(`./public/${filename}`, image.uint8Array);
    }

    return Response.json({ filename });
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
