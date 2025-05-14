import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utils for progress calculation
export const calculateProgressPercentage = (currentIndex: number | null | undefined, totalCards: number): number => {
  if (!totalCards) return 0;
  const index = currentIndex ?? 0;
  return (index / totalCards) * 100;
};

export const formatProgress = (currentIndex: number | null | undefined, totalCards: number): string => {
  return `${currentIndex ?? 0} / ${totalCards}`;
};
