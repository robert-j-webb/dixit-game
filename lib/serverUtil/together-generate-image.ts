import Together from "together-ai";

const together = new Together();

export async function togetherGenerateImage(
  model: string,
  prompt: string
): Promise<string> {
  const response = await together.images.create({
    model,
    prompt,
    width: 1024,
    height: 1024,
  });
  if (response.data[0].type === "b64_json") {
    return response.data[0].b64_json;
  } else {
    return response.data[0].url;
  }
}
