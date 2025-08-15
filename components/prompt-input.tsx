"use client";

import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { gameStateAtom, updateGameStateAtom } from "@/components/game-state";

export function PromptInput() {
  const gameState = useAtomValue(gameStateAtom);
  const updateGameState = useSetAtom(updateGameStateAtom);
  const [prompt, setPrompt] = useState(gameState.userPrompt);

  const handleContinue = () => {
    if (prompt.trim()) {
      updateGameState({
        userPrompt: prompt.trim(),
        step: "generation",
      });
    }
  };

  const handleBack = () => {
    updateGameState({ step: "selection" });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 mb-2 font-sans">
          Choose a prompt that you want the AI to guess as your image.
        </h2>
        <p className="text-amber-700">
          You want the AI to guess that your prompt is the image.
        </p>
      </div>

      {/* Selected Image Preview */}
      {gameState.selectedImage && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-4">
            <img
              src={gameState.selectedImage || "/placeholder.svg"}
              alt="Selected inspiration"
              className="w-64 h-full rounded"
            />
            <div className="w-full">
              <label className="text-sm font-medium text-amber-800">
                Your prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32 border-amber-200 focus:border-amber-500"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
        >
          Back to Selection
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!prompt.trim()}
          className="bg-amber-600 hover:bg-amber-700 text-white px-8"
        >
          Generate Images
        </Button>
      </div>
    </div>
  );
}
