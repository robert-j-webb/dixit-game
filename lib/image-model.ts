import { useSearchParams } from "next/navigation";

const togetherModels = [
  "black-forest-labs/FLUX.1-schnell",
  "black-forest-labs/FLUX.1-krea-dev",
  // "black-forest-labs/FLUX.1-kontext-dev", condition_image is required for this model
  "black-forest-labs/FLUX.1-kontext-pro",
  "black-forest-labs/FLUX.1-kontext-max",
  "black-forest-labs/FLUX.1-dev",
  // "black-forest-labs/FLUX.1-dev-lora", image_loras is required for this model
  // "black-forest-labs/FLUX.1-canny", reference image is missing
  // "black-forest-labs/FLUX.1-depth", reference image is missing
  // "black-forest-labs/FLUX.1-redux", reference image is missing
  "black-forest-labs/FLUX.1.1-pro",
  "black-forest-labs/FLUX.1-pro",
  // "black-forest-labs/FLUX.1-schnell-Free",
];

const fireworksModels = [
  // "flux-kontext-pro", Takes way too long
  // "flux-kontext-max",
  "flux-1-schnell-fp8",
  "flux-1-dev-fp8",
  "stable-diffusion-xl-1024-v1-0",
  "playground-v2-1024px-aesthetic",
  "playground-v2-5-1024px-aesthetic",
  "SSD-1B",
  "japanese-stable-diffusion-xl",
];

const baseTenModels = ["Flux.1-schnell"];

const amazonBedrockModels = [
  "amazon.nova-canvas-v1:0",
  "amazon.titan-image-generator-v2:0",
  "amazon.titan-image-generator-v1",
  "stability.stable-diffusion-xl-v1",
];

const googleVertexModels = [
  "imagen-4.0-generate-001",
  "imagen-4.0-ultra-generate-001",
  "imagen-4.0-fast-generate-001",
  "imagen-3.0-generate-002",
  "imagen-3.0-fast-generate-001",
  "imagegeneration@002",
];

export function useProvider() {
  const searchParams = useSearchParams();
  return searchParams.get("provider") ?? "together";
}

export function useImageModels() {
  const provider = useProvider();

  switch (provider) {
    case "together":
      return togetherModels;
    case "fireworks":
      return fireworksModels;
    case "base-ten":
      return baseTenModels;
    case "amazon-bedrock":
      return amazonBedrockModels;
    case "google-vertex":
      return googleVertexModels;
    default:
      throw new Error(`Invalid provider: ${provider}`);
  }
}
