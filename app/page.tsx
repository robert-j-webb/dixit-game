"use client";

import { useAtomValue } from "jotai";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ImageSelection } from "@/components/image-selection";
import { PromptInput } from "@/components/prompt-input";
import { ImageGeneration } from "@/components/image-generation";
import { ResultsDisplay } from "@/components/results-display";
import { gameStateAtom } from "@/components/game-state";
import { Suspense, useEffect, useState } from "react";

export default function DixitGame() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerDixitGame />
    </Suspense>
  );
}

function InnerDixitGame() {
  const gameState = useAtomValue(gameStateAtom);

  const getStepProgress = () => {
    switch (gameState.step) {
      case "selection":
        return 25;
      case "prompt":
        return 50;
      case "generation":
        return 75;
      case "results":
        return 100;
      default:
        return 0;
    }
  };

  const getStepTitle = () => {
    switch (gameState.step) {
      case "selection":
        return "Choose Your Inspiration";
      case "prompt":
        return "Craft Your Story";
      case "generation":
        return "AI Creates Your Vision";
      case "results":
        return "Discover Your Results";
      default:
        return "Dixit";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2 font-sans">
            Dixit
          </h1>
          <p className="text-amber-700 text-lg font-sans">
            Unleash Your Imagination Through AI-Powered Storytelling
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-amber-700 mb-2">
            <span>Step {getStepProgress() / 25} of 4</span>
            <span>{getStepTitle()}</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Main Game Area */}
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
          <div className="p-6">
            {gameState.step === "selection" && <ImageSelection />}

            {gameState.step === "prompt" && <PromptInput />}

            {gameState.step === "generation" && <ImageGeneration />}

            {gameState.step === "results" && <ResultsDisplay />}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-amber-600 text-sm">
          <p>Inspired by the classic storytelling board game</p>
        </div>
      </div>
    </div>
  );
}
