export async function POST(request: Request) {
  try {
    const { imageBase64, prompt, model } = await request.json();

    if (!prompt || !imageBase64 || !model) {
      return Response.json(
        { error: "Prompt, imageBase64, and model are required" },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present to get just the base64 data
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const apiKey = process.env.FIREWORKS_API_KEY;

    const jsonSchema = {
      type: "object",
      properties: {
        reasoning: {
          type: "string",
          description:
            "Detailed reasoning for why this image matches or doesn't match the given prompt, considering artistic style, composition, theme, and suitability for Dixit",
        },
        score: {
          type: "integer",
          minimum: 0,
          maximum: 100,
          description:
            "Numerical score from 0-100 indicating how well the image matches the prompt",
        },
      },
      required: ["reasoning", "score"],
      additionalProperties: false,
    };

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: `accounts/fireworks/models/${model}`,
          max_tokens: 1024,
          top_p: 1,
          top_k: 40,
          presence_penalty: 0,
          frequency_penalty: 0,
          temperature: 0.6,
          response_format: {
            type: "json_object",
            schema: jsonSchema,
          },
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`,
                  },
                },
                {
                  type: "text",
                  text: `Evaluate this image against the prompt: "${prompt}"

Please analyze how well this image matches the given prompt, considering:
- Artistic quality and style suitable for Dixit card game
- How well it represents the key elements mentioned in the prompt
- Creative interpretation and visual appeal
- Overall composition and aesthetics

Return your response as JSON with detailed reasoning and a score from 0-100.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fireworks API error:", errorText);
      return Response.json(
        { error: "Failed to evaluate image" },
        { status: 500 }
      );
    }

    const result = await response.json();

    return Response.json(result);
  } catch (error) {
    console.error("Error evaluating image:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
