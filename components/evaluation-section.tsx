"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

const visionEvalModels = [
  "llama4-maverick-instruct-basic",
  "llama4-scout-instruct-basic",
  "qwen2p5-vl-32b-instruct",
];

interface EvaluationSectionProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onEvaluate: () => void;
  isEvaluating: boolean;
  hasEvaluated: boolean;
}

export function EvaluationSection({
  selectedModel,
  onModelChange,
  onEvaluate,
  isEvaluating,
  hasEvaluated,
}: EvaluationSectionProps) {
  if (hasEvaluated) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <h3 className="text-xl font-bold text-purple-800">
            Evaluate Your Images
          </h3>
        </div>
        <p className="text-purple-700 mb-4">
          Choose an AI model to evaluate how well your images match your
          creative prompt
        </p>

        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-purple-800 mb-2">
              Select Evaluation Model:
            </label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent>
                {visionEvalModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={onEvaluate}
            disabled={!selectedModel || isEvaluating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
          >
            {isEvaluating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Evaluating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Evaluate Images
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
