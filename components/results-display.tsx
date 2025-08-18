"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RotateCcw, Sparkles } from "lucide-react";
import {
  gameStateAtom,
  resetGameAtom,
  updateGameStateAtom,
} from "@/components/game-state";
import { useState } from "react";
import { EvaluationSection } from "@/components/evaluation-section";
import { WinnerSpotlight } from "@/components/winner-spotlight";
import { AllResults } from "@/components/all-results";
import { useProvider } from "@/lib/image-model";

export function ResultsDisplay() {
  const gameState = useAtomValue(gameStateAtom);
  const resetGame = useSetAtom(resetGameAtom);
  const updateGameState = useSetAtom(updateGameStateAtom);

  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const provider = useProvider();
  const resetEvaluation = () => {
    setHasEvaluated(false);
    setSelectedModel("");
    // Clear scores from generated images
    const clearedImages = gameState.generatedImages.map((image) => ({
      src: image.src,
      model: image.model,
    }));
    updateGameState({
      generatedImages: clearedImages,
    });
  };

  const evaluateImages = async () => {
    if (!selectedModel) return;

    setIsEvaluating(true);
    try {
      // Collect all images to evaluate (selected image + generated images)
      const imagesToEvaluate = [];

      // Add selected image if it exists
      if (gameState.selectedImage) {
        imagesToEvaluate.push({
          src: gameState.selectedImage,
          model: "Selected Image",
        });
      }

      // Add all generated images
      imagesToEvaluate.push(...gameState.generatedImages);

      // Evaluate each image
      const evaluationPromises = imagesToEvaluate.map(async (image) => {
        const response = await fetch("/api/evaluateImage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: image.src,
            prompt: gameState.userPrompt,
            model: selectedModel,
            provider,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to evaluate image: ${response.statusText}`);
        }

        const result = await response.json();

        // Parse the evaluation result
        let score = 0;
        let reasoning = "";

        try {
          if (result.choices?.[0]?.message?.content) {
            const evaluation = JSON.parse(result.choices[0].message.content);
            score = evaluation.score || 0;
            reasoning = evaluation.reasoning || "";
          }
        } catch (parseError) {
          console.error("Failed to parse evaluation response:", parseError);
          console.log("Raw content:", result.choices?.[0]?.message?.content);
        }

        return {
          ...image,
          score,
          reasoning,
        };
      });

      updateGameState({
        generatedImages: await Promise.all(evaluationPromises),
      });

      setHasEvaluated(true);
    } catch (error) {
      console.error("Error evaluating images:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const sortedImages = [...gameState.generatedImages].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-800 mb-2 font-sans">
            Discover Your Results
          </h2>
          <p className="text-amber-700">
            Here's how the AI models interpreted your creative vision
          </p>
        </div>

        <EvaluationSection
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onEvaluate={evaluateImages}
          isEvaluating={isEvaluating}
          hasEvaluated={hasEvaluated}
        />

        <WinnerSpotlight
          winner={sortedImages[0] || null}
          hasEvaluated={hasEvaluated}
        />

        <AllResults images={sortedImages} hasEvaluated={hasEvaluated} />

        {/* Your Original Prompt */}
        <Card className="p-4 bg-amber-50 border-amber-200">
          <h3 className="font-medium text-amber-800 mb-2">
            Your Creative Prompt:
          </h3>
          <p className="text-amber-700 italic">"{gameState.userPrompt}"</p>
        </Card>

        {/* Actions */}
        <div className="text-center space-y-3">
          {hasEvaluated && (
            <div>
              <Button
                onClick={resetEvaluation}
                variant="outline"
                className="bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100 px-6 py-2"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Re-evaluate Images
              </Button>
            </div>
          )}
          <div>
            <Button
              onClick={() => resetGame()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Another Round
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
