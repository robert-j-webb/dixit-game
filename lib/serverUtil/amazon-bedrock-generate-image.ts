import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function amazonBedrockGenerateImage(
  modelId: string,
  prompt: string
): Promise<string> {
  if (modelId === "stability.stable-diffusion-xl-v1") {
    const payload = {
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 10,
      steps: 50,
      seed: 0,
      width: 1024,
      height: 1024,
      samples: 1,
    };
    const url = `https://bedrock-runtime.us-east-1.amazonaws.com/model/${modelId}/invoke`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AWS_BEARER_TOKEN_BEDROCK}`,
      },
      body: JSON.stringify(payload),
    });
    const responseBody = await response.json();
    return responseBody.artifacts[0].base64;
  }

  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      ...(process.env.AWS_SESSION_TOKEN && {
        sessionToken: process.env.AWS_SESSION_TOKEN,
      }),
    },
  });

  let payload = {
    textToImageParams: {
      text: prompt,
    },
    taskType: "TEXT_IMAGE",
    imageGenerationConfig: {
      cfgScale: 8,
      seed: 0,
      width: 1024,
      height: 1024,
      numberOfImages: 1,
    },
  };

  const command = new InvokeModelCommand({
    contentType: "application/json",
    body: JSON.stringify(payload),
    modelId,
  });
  const apiResponse = await client.send(command);

  const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
  const responseBody = JSON.parse(decodedResponseBody);
  return responseBody.images[0];
}
