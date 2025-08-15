import { atom } from "jotai";

export type GameStep = "selection" | "prompt" | "generation" | "results";

export interface GameState {
  step: GameStep;
  selectedImage: string | null;
  userPrompt: string;
  generatedImages: Array<{
    base64: string;
    model: string;
    score?: number;
    reasoning?: string;
  }>;
  isLoading: boolean;
}

export const gameStepAtom = atom<GameStep>("selection");

export const selectedImageAtom = atom<string | null>(null);

export const userPromptAtom = atom<string>(
  "Interpret <Fill it in>, suitable for a Dixit card game"
);

export const generatedImagesAtom = atom<
  Array<{
    base64: string;
    model: string;
    score?: number;
    reasoning?: string;
  }>
>([]);

export const isGameLoadingAtom = atom<boolean>(false);

// Derived atom that combines all state into a single GameState object
export const gameStateAtom = atom<GameState>((get) => ({
  step: get(gameStepAtom),
  selectedImage: get(selectedImageAtom),
  userPrompt: get(userPromptAtom),
  generatedImages: get(generatedImagesAtom),
  isLoading: get(isGameLoadingAtom),
}));

// Write-only atom for updating game state
export const updateGameStateAtom = atom(
  null,
  (get, set, updates: Partial<GameState>) => {
    if (
      Object.prototype.hasOwnProperty.call(updates, "step") &&
      updates.step !== undefined
    ) {
      set(gameStepAtom, updates.step);
    }
    if (
      Object.prototype.hasOwnProperty.call(updates, "selectedImage") &&
      updates.selectedImage !== undefined
    ) {
      set(selectedImageAtom, updates.selectedImage);
    }
    if (
      Object.prototype.hasOwnProperty.call(updates, "userPrompt") &&
      updates.userPrompt !== undefined
    ) {
      set(userPromptAtom, updates.userPrompt);
    }
    if (
      Object.prototype.hasOwnProperty.call(updates, "generatedImages") &&
      updates.generatedImages !== undefined
    ) {
      set(generatedImagesAtom, updates.generatedImages);
    }
    if (
      Object.prototype.hasOwnProperty.call(updates, "isLoading") &&
      updates.isLoading !== undefined
    ) {
      set(isGameLoadingAtom, updates.isLoading);
    }
  }
);

// Write-only atom for resetting the game
export const resetGameAtom = atom(null, (get, set) => {
  set(gameStepAtom, "selection");
  set(selectedImageAtom, null);
  set(userPromptAtom, "");
  set(generatedImagesAtom, []);
  set(isGameLoadingAtom, false);
});
