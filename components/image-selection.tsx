"use client";

import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { updateGameStateAtom } from "@/components/game-state";
import { useImageModels, useProvider } from "@/lib/image-model";

// Function to randomly select unique novel titles
function getRandomTitles(count: number = 5): string[] {
  const shuffled = [...ALL_NOVEL_TITLES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Hook to generate multiple images for novel titles
function useGenerateMultipleImages(novelTitles: string[]) {
  const [images, setImages] = useState<{ [key: string]: string | null }>({});
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const provider = useProvider();
  // Initialize states with no loading
  useEffect(() => {
    const initialImages: { [key: string]: string | null } = {};
    const initialLoading: { [key: string]: boolean } = {};
    const initialErrors: { [key: string]: string | null } = {};

    novelTitles.forEach((title, index) => {
      initialImages[index] = null;
      initialLoading[index] = false;
      initialErrors[index] = null;
    });

    setImages(initialImages);
    setLoadingStates(initialLoading);
    setErrors(initialErrors);
  }, [novelTitles]);

  const generateImages = async (selectedModel: string) => {
    if (!selectedModel) return;

    setIsGenerating(true);

    // Set all images to loading state
    const loadingState: { [key: string]: boolean } = {};
    novelTitles.forEach((title, index) => {
      loadingState[index] = true;
    });
    setLoadingStates(loadingState);

    // Clear previous errors
    const clearedErrors: { [key: string]: string | null } = {};
    novelTitles.forEach((title, index) => {
      clearedErrors[index] = null;
    });
    setErrors(clearedErrors);

    // Generate images for each title
    await Promise.all(
      novelTitles.map(async (title, index) => {
        try {
          const prompt = `Interpret ${title}, suitable for a Dixit card game`;
          const response = await fetch(
            `/api/generateImage?prompt=${encodeURIComponent(
              prompt
            )}&model=${selectedModel}&provider=${provider}`
          );

          if (!response.ok) {
            throw new Error("Failed to generate image");
          }

          const data = await response.json();
          const imageUrl = data.url
            ? data.url
            : `data:image/png;base64,${data.base64}`;

          setImages((prev) => ({ ...prev, [index]: imageUrl }));
          setLoadingStates((prev) => ({ ...prev, [index]: false }));
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
          setErrors((prev) => ({ ...prev, [index]: errorMessage }));
          setLoadingStates((prev) => ({ ...prev, [index]: false }));
        }
      })
    );
  };

  const allLoaded = Object.values(loadingStates).every((loading) => !loading);
  const hasErrors = Object.values(errors).some((error) => error !== null);
  const hasAnyImages = Object.values(images).some((image) => image !== null);
  const anyLoading = Object.values(loadingStates).some((loading) => loading);

  // Check if generation is complete
  useEffect(() => {
    if (isGenerating && allLoaded) {
      setIsGenerating(false);
    }
  }, [isGenerating, allLoaded]);

  return {
    images,
    loadingStates,
    errors,
    allLoaded,
    hasErrors,
    hasAnyImages,
    anyLoading,
    isGenerating,
    generateImages,
  };
}

interface ImageCardProps {
  title: string;
  index: number;
  imageUrl: string;
  isLoading: boolean;
  isSelected: boolean;
  isHovered: boolean;
  totalCards: number;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
  disabled: boolean;
}

function ImageCard({
  title,
  index,
  imageUrl,
  isLoading,
  isSelected,
  isHovered,
  totalCards,
  onSelect,
  onHover,
  disabled,
}: ImageCardProps) {
  // Calculate rotation and position for hand of cards effect
  const centerIndex = (totalCards - 1) / 2;
  const rotationAngle = (index - centerIndex) * 8; // 8 degrees per card
  const translateX = (index - centerIndex) * 120; // 60px spacing
  const translateY = Math.abs(index - centerIndex) * 15; // Slight arc effect

  // Z-index logic: selected > hovered > normal stacking
  let zIndex = totalCards - Math.abs(index - centerIndex); // Natural fan stacking
  if (isHovered && !isSelected) zIndex = totalCards + 10;
  if (isSelected) zIndex = totalCards + 20;

  const imgScale = isSelected ? 1.5 : isHovered ? 1.15 : 1;

  const transform = `
    translateX(${isSelected ? 0 : translateX}px) 
    translateY(${isSelected ? 0 : translateY}px) 
    rotate(${isSelected ? 0 : rotationAngle}deg)
    scale(${imgScale})
    ${isSelected ? "translateY(-20px)" : ""}
  `;

  return (
    <Card
      className={`absolute cursor-pointer transition-all duration-300 ease-out ${
        disabled ? "opacity-50" : ""
      } ${
        isSelected
          ? "ring-2 ring-amber-500 shadow-2xl"
          : isHovered
          ? "ring-1 ring-amber-400 shadow-xl"
          : "shadow-lg hover:shadow-xl"
      }`}
      style={{
        transform: transform.replace(/\s+/g, " ").trim(),
        zIndex,
        transformOrigin: "center bottom",
      }}
      onClick={() => !disabled && onSelect(index)}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="p-3">
        {isLoading ? (
          <div className="w-full h-32 bg-amber-100 rounded flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="relative">
            <img
              src={imageUrl}
              alt={`Inspiration image ${index + 1}: ${title}`}
              className="w-full h-64 object-cover rounded w-min-[300px]"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export function ImageSelection() {
  const updateGameState = useSetAtom(updateGameStateAtom);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const imageModels = useImageModels();
  const [selectedModel, setSelectedModel] = useState<string>(imageModels[0]);
  const [novelTitles, setNovelTitles] = useState<string[]>(() =>
    getRandomTitles(5)
  );
  const { images, loadingStates, anyLoading, generateImages, hasAnyImages } =
    useGenerateMultipleImages(novelTitles);

  const provider = useProvider();

  useEffect(() => {
    setSelectedModel(imageModels[0]);
  }, [provider, imageModels]);

  const handleImageSelect = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
      updateGameState({ selectedImage: null });
      return;
    }
    setSelectedIndex(index);
    const generatedImage = images[index];
    const imageUrl = generatedImage || null;
    updateGameState({ selectedImage: imageUrl });
  };

  const handleContinue = () => {
    if (selectedIndex !== null) {
      updateGameState({ step: "prompt" });
    }
  };

  const handleGenerate = () => {
    generateImages(selectedModel);
  };

  const handleCardHover = (index: number | null) => {
    setHoveredIndex(index);
  };

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

      <div className="flex justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-700">
              AI Image Model
            </label>
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
              disabled={anyLoading}
            >
              <SelectTrigger className="w-64 border-amber-200 focus:ring-amber-500">
                <SelectValue placeholder="Select an AI model" />
              </SelectTrigger>
              <SelectContent>
                {imageModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={anyLoading || !selectedModel}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2"
            >
              {anyLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating Images...
                </>
              ) : (
                "Generate Images"
              )}
            </Button>
          </div>
          <div className="h-[100px]" />
          {anyLoading && (
            <p className="text-sm text-amber-600">
              {
                Object.values(loadingStates).filter((loading) => !loading)
                  .length
              }{" "}
              of {novelTitles.length} images ready
            </p>
          )}
        </div>
      </div>
      {hasAnyImages && (
        <div className="relative flex justify-center items-end min-h-[300px] py-8">
          {novelTitles.map((title, index) => {
            const generatedImage = images[index];
            const imageUrl =
              generatedImage ||
              `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(
                `Abstract artistic interpretation of ${title}`
              )}`;
            const isLoading = loadingStates[index];

            return (
              <ImageCard
                key={index}
                title={title}
                index={index}
                imageUrl={imageUrl}
                isLoading={isLoading}
                isSelected={selectedIndex === index}
                isHovered={hoveredIndex === index}
                totalCards={novelTitles.length}
                onSelect={handleImageSelect}
                onHover={handleCardHover}
                disabled={anyLoading}
              />
            );
          })}
        </div>
      )}

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

const ALL_NOVEL_TITLES = [
  "The Midnight Library",
  "Ocean's Whisper",
  "Neon Dreams",
  "The Last Garden",
  "Starlight Express",
  "Crimson Shadows",
  "The Glass Tower",
  "Whispers of Tomorrow",
  "The Silent Storm",
  "Dancing with Ghosts",
  "The Velvet Underground",
  "Mirrors of Memory",
  "The Clockmaker's Dream",
  "Fragments of Light",
  "The Wandering Moon",
  "Echoes in the Rain",
  "The Phantom Garden",
  "Threads of Destiny",
  "The Crystal Cavern",
  "Songs of the Deep",
  "The Painted Sky",
  "Shadows and Silver",
  "The Forgotten Kingdom",
  "Dreams of Fire",
  "The Ivory Tower",
  "Secrets of the Mist",
  "The Dancing Flame",
  "Whispers in the Wind",
  "The Golden Compass",
  "Tales of Wonder",
  "The Enchanted Forest",
  "Rivers of Time",
  "The Starlit Path",
  "Mysteries of the Heart",
  "The Ancient Oak",
  "Legends of the Lost",
  "The Sapphire Crown",
  "Voices from Beyond",
  "The Infinite Journey",
  "Tales of Magic",
  "The Distant Shore",
  "Shadows of the Past",
  "The Burning Bridge",
  "Dreams of Tomorrow",
  "The Sacred Mountain",
  "The Whispering Woods",
  "Echoes of Eternity",
  "The Hidden Valley",
  "Songs of Sorrow",
  "The Broken Chain",
  "The Silver Thread",
  "Memories of Stone",
  "The Forgotten Song",
  "Winds of Change",
  "The Crystal Lake",
  "The Moonlit Castle",
  "Shadows of Light",
  "The Golden Age",
  "Dreams of the Desert",
  "The Lost City",
  "The Weaving Stars",
  "Echoes of Hope",
  "The Darkest Hour",
  "Songs of the Night",
  "The Crimson Rose",
  "The Shattered Mirror",
  "Whispers of the Sea",
  "The Eternal Dance",
  "Dreams of Ice",
  "The Floating Island",
  "The Phoenix Rising",
  "Shadows of Dawn",
  "The Marble Heart",
  "Songs of Freedom",
  "The Silver Moon",
  "The Painted Door",
  "Echoes of Love",
  "The Blazing Sun",
  "Dreams of Gold",
  "The Singing River",
  "The Velvet Night",
  "Shadows of Tomorrow",
  "The Crystal Palace",
  "Songs of Joy",
  "The Emerald Forest",
  "The Broken Crown",
  "Whispers of Time",
  "The Endless Road",
  "Dreams of Spring",
  "The Lighthouse Keeper",
  "The Copper Mountain",
  "Echoes of Peace",
  "The Frozen Lake",
  "Songs of the Earth",
  "The Diamond Cave",
  "The Purple Horizon",
  "Shadows of Hope",
  "The Glass Slipper",
  "Dreams of Summer",
  "The Dancing Trees",
  "The Iron Gate",
  "Whispers of Love",
  "The Crimson Dawn",
  "Songs of the Wind",
  "The Azure Bay",
];
