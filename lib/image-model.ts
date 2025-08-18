import { useSearchParams } from "next/navigation";

const togetherModels = [
  "black-forest-labs/FLUX.1-krea-dev",
  // "black-forest-labs/FLUX.1-kontext-dev", condition_image is required for this model
  "black-forest-labs/FLUX.1-kontext-pro",
  "black-forest-labs/FLUX.1-kontext-max",
  "black-forest-labs/FLUX.1-dev",
  // "black-forest-labs/FLUX.1-dev-lora", image_loras is required for this model
  "black-forest-labs/FLUX.1-schnell",
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

export function useProvider() {
  const searchParams = useSearchParams();
  return searchParams.get("provider");
}

export function useImageModels() {
  const provider = useProvider();

  if (provider === "together") {
    return togetherModels;
  } else {
    return fireworksModels;
  }
}
