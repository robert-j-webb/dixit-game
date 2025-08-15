"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trophy, Medal, Award, Info } from "lucide-react";

interface ResultImage {
  base64: string;
  model: string;
  score?: number;
  reasoning?: string;
}

interface AllResultsProps {
  images: ResultImage[];
  hasEvaluated: boolean;
}

export function AllResults({ images, hasEvaluated }: AllResultsProps) {
  if (!hasEvaluated) return null;

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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-amber-800">
        Complete Rankings
      </h3>
      <div className="grid gap-4">
        {images.map((image, index) => (
          <Card key={index} className={`p-4 ${getRankColor(index)}`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-0">
                {getRankIcon(index)}
                <span className="font-bold text-amber-800">#{index + 1}</span>
              </div>
              <img
                src={image.base64 || "/placeholder.svg"}
                alt={`${image.model} result`}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-amber-800 truncate">
                  {image.model}
                </p>
                {image.reasoning ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="mt-1 cursor-help">
                        {image.score}/100
                        <Info className="h-3 w-3 ml-1" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{image.reasoning}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Badge variant="outline" className="mt-1">
                    {image.score}/100
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
