import { createVertex } from "@ai-sdk/google-vertex";
import { experimental_generateImage as generateImage } from "ai";

export const vertex = createVertex({
  googleAuthOptions: {
    credentials: {
      private_key: process.env
        .MY_PROJECT_SERVICE_ACCOUNT_KEY!.split(String.raw`\n`)
        .join("\n"),
      type: "service_account",
      project_id: "responsive-hall-464216-e9",
      private_key_id: "cc274f4c279b7a373816e5563e93d5175883dc66",
      client_email:
        "rob-dixit-game@responsive-hall-464216-e9.iam.gserviceaccount.com",
      client_id: "108436188649065373841",
    },
  },
  location: "us-central1",
  project: "responsive-hall-464216-e9",
});

export async function googleVertexGenerateImage(
  modelId: string,
  prompt: string
): Promise<string> {
  const response = await generateImage({
    model: vertex.image(modelId),
    prompt,
  });
  return response.image.base64;
}
