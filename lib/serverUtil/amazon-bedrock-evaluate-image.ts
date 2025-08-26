import {
  BedrockRuntimeClient,
  ConversationRole,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function amazonBedrockEvaluateImage({
  imageBase64,
  prompt,
  model,
  jsonSchema,
}: {
  imageBase64: string;
  prompt: string;
  model: string;
  jsonSchema: Record<string, any>;
}) {
  // Remove data URL prefix if present to get just the base64 data
  const base64Data = Buffer.from(
    imageBase64.replace(/^data:image\/[a-z]+;base64,/, ""),
    "base64"
  );

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

  try {
    const response = await client.send(
      new ConverseCommand({
        modelId: model,
        messages: [
          {
            content: [
              {
                image: {
                  format: "png",
                  source: { bytes: base64Data },
                },
              },
              { text: prompt },
              {
                text:
                  "Use this Schema when generating output: " +
                  JSON.stringify(jsonSchema),
              },
            ],
            role: ConversationRole.USER,
          },
        ],
        inferenceConfig: {
          maxTokens: 1024,
          temperature: 0.5,
        },
      })
    );
    const answer = JSON.parse(
      response.output?.message?.content?.[0]?.text ?? "{}"
    );
    const score = answer.score ?? answer.properties?.score ?? 0;
    const reasoning =
      answer.reasoning ?? answer.properties?.reasoning ?? "Error parsing";
    return returnWrapResponse(score, reasoning);
  } catch (error) {
    throw error;
  }
}

function returnWrapResponse(score: number, reasoning: string) {
  return {
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: JSON.stringify({ reasoning, score }),
        },
        finish_reason: "stop",
      },
    ],
  };
}
