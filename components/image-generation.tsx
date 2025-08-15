"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Shuffle, CheckCircle } from "lucide-react";
import { gameStateAtom, updateGameStateAtom } from "@/components/game-state";
import { imageModels } from "./image-selection";

const imagesWithoutFlux = imageModels.filter(
  (model) => !model.includes("flux-kontext")
);

export function ImageGeneration() {
  const gameState = useAtomValue(gameStateAtom);
  const updateGameState = useSetAtom(updateGameStateAtom);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedModels, setSelectedModels] = useState<string[]>(() =>
    getRandomModels()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<
    Array<{ base64: string; model: string; score?: number }>
  >([]);

  const generateImages = async () => {
    if (!gameState.userPrompt || isGenerating) return;

    setIsGenerating(true);
    setIsGenerationComplete(false);
    updateGameState({ isLoading: true });
    setCurrentStep(0);
    setGeneratedImages([]);
    const newGeneratedImages: Array<{
      base64: string;
      model: string;
      score?: number;
    }> = [];

    // Generate images with selected models
    await Promise.all(
      selectedModels.map(async (model) => {
        try {
          const prompt = `${gameState.userPrompt}`;
          const response = await fetch(
            `/api/generateImage?prompt=${encodeURIComponent(
              prompt
            )}&model=${model}`
          );

          if (!response.ok) {
            throw new Error(`Failed to generate image with ${model}`);
          }

          const data = await response.json();
          const imageBase64 = `data:image/png;base64,${data.base64}`;

          const newImage = {
            base64: imageBase64,
            model: model,
          };

          newGeneratedImages.push(newImage);
          setGeneratedImages((prev) => [...prev, newImage]);
        } catch (error) {
          console.error(`Error generating image with ${model}:`, error);
          // Continue with next model even if one fails
          const fallbackImage = {
            base64: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(
              `${gameState.userPrompt} in ${model} style`
            )}`,
            model: model,
          };
          newGeneratedImages.push(fallbackImage);
          setGeneratedImages((prev) => [...prev, fallbackImage]);
          setCurrentStep((prev) => prev + 1);
        }
      })
    );

    // AI evaluation step
    setCurrentStep(selectedModels.length + 1);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add random scores to completed images
    const imagesWithScores = newGeneratedImages.map((img) => ({
      ...img,
      score: Math.floor(Math.random() * 30) + 70, // Scores between 70-100
    }));

    updateGameState({
      generatedImages: imagesWithScores,
      isLoading: false,
    });
    setIsGenerating(false);
    setIsGenerationComplete(true);
  };

  const handleShuffleModels = () => {
    if (!isGenerating) {
      setSelectedModels(getRandomModels());
      setGeneratedImages([]);
      setCurrentStep(0);
      setIsGenerationComplete(false);
    }
  };

  const handleContinueToResults = () => {
    updateGameState({ step: "results" });
  };

  const getStepMessage = () => {
    if (currentStep > 0) {
      return `${generatedImages.length} images generated.`;
    }
    if (currentStep > selectedModels.length) {
      return "AI is evaluating your creations...";
    }
    return "Ready to generate images";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 mb-2 font-sans">
          AI Creates Your Vision
        </h2>
        <p className="text-amber-700">
          Choose your AI models and generate unique interpretations
        </p>
      </div>

      {/* Selected Models Display */}
      <Card className="p-4 border-amber-200">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-amber-800 text-center">
            Selected AI Models ({selectedModels.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedModels.map((model, index) => (
              <div
                key={model}
                className="p-2 bg-amber-50 border border-amber-200 rounded text-center"
              >
                <p className="text-sm font-medium text-amber-800">
                  {model
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <Button
              onClick={handleShuffleModels}
              disabled={isGenerating}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle Models
            </Button>
            <Button
              onClick={generateImages}
              disabled={!gameState.userPrompt || isGenerating}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Images
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Progress Indicator - Only show during generation */}
      {isGenerating && (
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <div className="text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-amber-600 animate-pulse" />
            <div>
              <p className="text-lg font-medium text-amber-800">
                {getStepMessage()}
              </p>
              <p className="text-sm text-amber-600">
                Step {currentStep} of {selectedModels.length}
              </p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
            </div>
          </div>
        </Card>
      )}

      {/* Your Prompt */}
      <Card className="p-4 bg-white border-amber-200">
        <h3 className="font-medium text-amber-800 mb-2">
          Your Creative Prompt:
        </h3>
        <p className="text-amber-700 italic">"{gameState.userPrompt}"</p>
      </Card>

      {/* Generated Images Preview */}
      {generatedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {generatedImages.map((image, index) => (
            <Card key={index} className="p-3 border-amber-200">
              <img
                src={image.base64 || "/placeholder.svg"}
                alt={`Generated by ${image.model}`}
                className="w-full h-full rounded mb-2 object-contain"
              />
              <p className="text-xs text-center text-amber-700 font-medium">
                {image.model}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Continue Button */}
      {isGenerationComplete && (
        <div className="text-center">
          <Button onClick={handleContinueToResults}>
            <CheckCircle className="h-5 w-5 mr-2" />
            Continue to Image Evaluation
          </Button>
        </div>
      )}
    </div>
  );
}

// Function to randomly select 5 models from the full list
function getRandomModels(count: number = 5): string[] {
  const shuffled = [...imagesWithoutFlux].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
