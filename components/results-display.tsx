"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, RotateCcw } from "lucide-react";
import { gameStateAtom, resetGameAtom } from "@/components/game-state";

export function ResultsDisplay() {
  const gameState = useAtomValue(gameStateAtom);
  const resetGame = useSetAtom(resetGameAtom);
  const sortedImages = [...gameState.generatedImages].sort(
    (a, b) => (b.score || 0) - (a.score || 0),
  );

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-100 border-yellow-300";
      case 1:
        return "bg-gray-100 border-gray-300";
      case 2:
        return "bg-amber-100 border-amber-300";
      default:
        return "bg-white border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 mb-2 font-sans">
          Discover Your Results
        </h2>
        <p className="text-amber-700">
          Here's how the AI models interpreted your creative vision
        </p>
      </div>

      {/* Winner Spotlight */}
      {sortedImages[0] && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-amber-800">Winner!</h3>
            </div>
            <img
              src={sortedImages[0].url || "/placeholder.svg"}
              alt={`Winner: ${sortedImages[0].model}`}
              className="w-48 h-48 object-cover rounded-lg mx-auto shadow-lg"
            />
            <div>
              <p className="font-medium text-amber-800">
                {sortedImages[0].model}
              </p>
              <Badge
                variant="secondary"
                className="bg-yellow-200 text-yellow-800"
              >
                Score: {sortedImages[0].score}/100
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* All Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-amber-800">
          Complete Rankings
        </h3>
        <div className="grid gap-4">
          {sortedImages.map((image, index) => (
            <Card key={index} className={`p-4 ${getRankColor(index)}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  {getRankIcon(index)}
                  <span className="font-bold text-amber-800">#{index + 1}</span>
                </div>
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`${image.model} result`}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-amber-800 truncate">
                    {image.model}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {image.score}/100
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Your Original Prompt */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <h3 className="font-medium text-amber-800 mb-2">
          Your Creative Prompt:
        </h3>
        <p className="text-amber-700 italic">"{gameState.userPrompt}"</p>
      </Card>

      {/* Play Again */}
      <div className="text-center">
        <Button
          onClick={() => resetGame()}
          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Play Another Round
        </Button>
      </div>
    </div>
  );
}
