import { matchGrays } from "miniature-waffle";
import type { FinderResult, PanelNode } from "./divFinder";

function treeDepth(nodes: PanelNode[]): number {
	if (nodes.length === 0) return 0;
	return 1 + Math.max(...nodes.map((n) => treeDepth(n.children)));
}

function colorTree(
	nodes: PanelNode[],
	depth: number,
	grays: [number, number, number][],
): void {
	for (const node of nodes) {
		const [r, g, b] = grays[depth - 1];
		node.div.style.backgroundColor = `rgb(${r},${g},${b})`;
		colorTree(node.children, depth + 1, grays);
	}
}

export function getLightness(): number {
	const stored = localStorage.getItem("lightness");
	if (stored === null) {
		localStorage.setItem("lightness", "75");
		return 75;
	}
	const parsed = parseFloat(stored);
	if (!Number.isFinite(parsed)) {
		localStorage.setItem("lightness", "75");
		return 75;
	}
	return parsed;
}

export function applyColors({ panels }: FinderResult): void {
	const L = getLightness();

	const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const reference = isDark ? 0 : 100;

	const n = treeDepth(panels);
	if (n > 0) {
		const grays = matchGrays(n + 1, L, reference);
		colorTree(panels, 1, grays);
	}
}
