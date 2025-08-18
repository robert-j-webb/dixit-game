import { experimental_generateImage as generateImage } from "ai";
import { createFireworks } from "@ai-sdk/fireworks";

const fireworks = createFireworks({
  apiKey: process.env.FIREWORKS_API_KEY ?? "",
});

export async function fireworksGenerateImage(
  model: string,
  prompt: string
): Promise<string> {
  if (isFluxModel(model)) {
    return await generateFluxImage(model, prompt);
  } else {
    // Use existing AI SDK for non-flux models
    const { image } = await generateImage({
      model: fireworks.image(`accounts/fireworks/models/${model}`),
      prompt,
      size: "1024x1024",
    });

    return Buffer.from(image.uint8Array).toString("base64");
  }
}

// Check if model is a flux model that requires direct API
function isFluxModel(model: string): boolean {
  return model.includes("flux-kontext");
}

// Generate image using direct Fireworks API for flux models
async function generateFluxImage(
  model: string,
  prompt: string
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
    console.error(result);
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
