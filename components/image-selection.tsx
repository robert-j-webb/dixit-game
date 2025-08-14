"use client";

import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { gameStateAtom, updateGameStateAtom } from "@/components/game-state";

const NOVEL_TITLES = [
  "The Midnight Library",
  "Ocean's Whisper",
  "Neon Dreams",
  "The Last Garden",
  "Starlight Express",
];

export function ImageSelection() {
  const gameState = useAtomValue(gameStateAtom);
  const updateGameState = useSetAtom(updateGameStateAtom);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Generate placeholder images for the novel titles
    const generateImages = async () => {
      setLoading(true);
      const imageUrls = NOVEL_TITLES.map(
        (title, index) =>
          `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(
            `Abstract artistic interpretation of ${title}`,
          )}`,
      );
      setImages(imageUrls);
      setLoading(false);
    };

    generateImages();
  }, []);

  const handleImageSelect = (index: number) => {
    setSelectedIndex(index);
    updateGameState({ selectedImage: images[index] });
  };

  const handleContinue = () => {
    if (selectedIndex !== null) {
      updateGameState({ step: "prompt" });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
        <p className="text-amber-700">Generating inspiration images...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 mb-2 font-sans">
          Choose an image that speaks to your story
        </h2>
        <p className="text-amber-700">
          Select one of these AI-generated images inspired by novel titles
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              selectedIndex === index
                ? "ring-2 ring-amber-500 shadow-lg"
                : "hover:ring-1 hover:ring-amber-300"
            }`}
            onClick={() => handleImageSelect(index)}
          >
            <div className="p-2">
              <img
                src={image || "/placeholder.svg"}
                alt={`Inspiration image ${index + 1}: ${NOVEL_TITLES[index]}`}
                className="w-full h-32 object-cover rounded"
              />
              <p className="text-xs text-center mt-2 text-amber-700 font-medium">
                {NOVEL_TITLES[index]}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={handleContinue}
          disabled={selectedIndex === null}
          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2"
        >
          Continue to Story Creation
        </Button>
      </div>
    </div>
  );
}
