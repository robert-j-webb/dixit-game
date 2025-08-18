"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trophy, Info } from "lucide-react";

interface WinnerImage {
  src: string;
  model: string;
  score?: number;
  reasoning?: string;
}

interface WinnerSpotlightProps {
  winner: WinnerImage | null;
  hasEvaluated: boolean;
}

export function WinnerSpotlight({
  winner,
  hasEvaluated,
}: WinnerSpotlightProps) {
  if (!hasEvaluated || !winner) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-amber-800">Winner!</h3>
        </div>
        <img
          src={winner.src || "/placeholder.svg"}
          alt={`Winner: ${winner.model}`}
          className="w-48 h-48 object-cover rounded-lg mx-auto shadow-lg"
        />
        <div>
          <p className="font-medium text-amber-800">{winner.model}</p>
          {winner.reasoning ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="bg-yellow-200 text-yellow-800 cursor-help"
                >
                  Score: {winner.score}/100
                  <Info className="h-3 w-3 ml-1" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{winner.reasoning}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Badge
              variant="secondary"
              className="bg-yellow-200 text-yellow-800"
            >
              Score: {winner.score}/100
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
