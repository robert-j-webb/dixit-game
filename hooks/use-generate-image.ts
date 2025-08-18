import { useState, useEffect } from "react";

export function useGenerateImage(prompt: string, model: string) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prompt || !model) return;

    const generateImage = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/generateImage?prompt=${encodeURIComponent(
            prompt
          )}&model=${model}`
        );

        if (!response.ok) {
          throw new Error("Failed to generate image");
        }

        const data = await response.json();
        const imageUrl = data.url
          ? data.url
          : `data:image/png;base64,${data.base64}`;

        setImage(imageUrl);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    generateImage();
  }, [prompt, model]);

  return { image, loading, error };
}
