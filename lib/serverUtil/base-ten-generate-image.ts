export async function baseTenGenerateImage(
  model: string,
  prompt: string
): Promise<string> {
  const resp = await fetch(
    "https://model-lqzzlnkq.api.baseten.co/environments/production/predict",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Api-Key " + process.env.BASETEN_API_KEY,
      },
      body: JSON.stringify({ prompt }),
    }
  );

  const data = await resp.json();
  return data.data;
}
