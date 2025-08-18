import { useProvider } from "./image-model";

const togetherModels = [
  "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
  "meta-llama/Llama-4-Scout-17B-16E-Instruct",
  "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
  "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
  "Qwen/Qwen2-VL-72B-Instruct",
  "google/gemma-3n-E4B-it",
  "arcee_ai/arcee-spotlight",
];

const fireworksModels = [
  "llama4-maverick-instruct-basic",
  "llama4-scout-instruct-basic",
  "qwen2p5-vl-32b-instruct",
];

const baseTenModels = [
  "meta-llama/Llama-4-Scout-17B-16E-Instruct",
  "meta-llama/Llama-4-Maverick-17B-128E-Instruct",
  "openai/gpt-oss-120b",
  "Qwen/Qwen3-235B-A22B-Instruct-2507",
];

export function useVisionModels() {
  const provider = useProvider();

  switch (provider) {
    case "together":
      return togetherModels;
    case "fireworks":
      return fireworksModels;
    case "base-ten":
      return baseTenModels;
    default:
      throw new Error(`Invalid provider: ${provider}`);
  }
}
