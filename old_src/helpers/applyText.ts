import { squeezeText } from "psychic-potato";
import type { FinderResult } from "./divFinder";

export function applyText({ labels }: FinderResult): void {
	if (labels.length === 0) return;
	squeezeText(labels);
}
