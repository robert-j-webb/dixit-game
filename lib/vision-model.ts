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

const amazonBedrockModels = [
  "amazon.nova-lite-v1:0",
  "amazon.nova-premier-v1:0",
  "amazon.nova-pro-v1:0",
  "anthropic.claude-3-haiku-20240307-v1:0",
  "anthropic.claude-3-opus-20240229-v1:0",
  "anthropic.claude-3-sonnet-20240229-v1:0",
  "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "anthropic.claude-3-5-sonnet-20240620-v1:0",
  "anthropic.claude-3-7-sonnet-20250219-v1:0",
  "anthropic.claude-opus-4-1-20250805-v1:0",
  "anthropic.claude-opus-4-20250514-v1:0",
  "anthropic.claude-sonnet-4-20250514-v1:0",
  // "meta.llama3-2-11b-instruct-v1:0", Illegal in EU
  // "meta.llama3-2-90b-instruct-v1:0",
  // "meta.llama4-maverick-17b-instruct-v1:0",
  // "meta.llama4-scout-17b-instruct-v1:0",
  "mistral.pixtral-large-2502-v1:0",
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
    case "amazon-bedrock":
      return amazonBedrockModels;
    default:
      throw new Error(`Invalid provider: ${provider}`);
  }
}
