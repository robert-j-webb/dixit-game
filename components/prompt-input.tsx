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
          Craft a prompt that brings your image to life
        </h2>
        <p className="text-amber-700">
          Describe what you want the AI to create based on your selected
          inspiration
        </p>
      </div>

      {/* Selected Image Preview */}
      {gameState.selectedImage && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-4">
            <img
              src={gameState.selectedImage || "/placeholder.svg"}
              alt="Selected inspiration"
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <p className="text-sm text-amber-700 font-medium">
                Your selected inspiration
              </p>
              <p className="text-xs text-amber-600">
                This will guide the AI's creative process
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-amber-800">
          Your Creative Prompt
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the scene, mood, style, or story you want the AI to create..."
          className="min-h-32 border-amber-200 focus:border-amber-500"
        />
        <p className="text-xs text-amber-600">
          Be creative! The more descriptive you are, the better the AI can
          interpret your vision.
        </p>
      </div>

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
