"use client";

import { useAtomValue } from "jotai";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageSelection } from "@/components/image-selection";
import { PromptInput } from "@/components/prompt-input";
import { ImageGeneration } from "@/components/image-generation";
import { ResultsDisplay } from "@/components/results-display";
import { gameStateAtom } from "@/components/game-state";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProvider = searchParams.get("provider");

  useEffect(() => {
    if (!currentProvider) {
      router.replace("?provider=together");
    }
  }, [currentProvider, router]);

  const handleProviderChange = (provider: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("provider", provider);
    router.replace(`?${params.toString()}`);
  };

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
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1" />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-amber-800 mb-2 font-sans">
                Dixit
              </h1>
              <p className="text-amber-700 text-lg font-sans">
                Unleash Your Imagination Through AI-Powered Storytelling
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex flex-col items-end">
                <label className="text-sm text-amber-700 mb-1 font-medium">
                  Provider
                </label>
                <Select
                  value={currentProvider}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger className="w-32 text-amber-800 border-amber-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="together">Together</SelectItem>
                    <SelectItem value="fireworks">Fireworks</SelectItem>
                    <SelectItem value="base-ten">Base Ten</SelectItem>
                    <SelectItem value="amazon-bedrock">Amazon Bedrock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
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
