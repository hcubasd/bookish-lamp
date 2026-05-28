export type PanelNode = { div: HTMLDivElement; children: PanelNode[] };
export type FinderResult = { panels: PanelNode[]; labels: HTMLDivElement[] };

function buildChildren(el: HTMLElement, labels: HTMLDivElement[]): PanelNode[] {
	const nodes: PanelNode[] = [];
	for (const child of el.children) {
		if (child.tagName !== "DIV") continue;
		const div = child as HTMLDivElement;
		if (div.classList.contains("panel")) {
			nodes.push({ div, children: buildChildren(div, labels) });
		} else if (div.classList.contains("label")) {
			labels.push(div);
		} else {
			nodes.push(...buildChildren(div, labels));
		}
	}
	return nodes;
}

export function divFinder(root: HTMLElement): FinderResult {
	const labels: HTMLDivElement[] = [];
	if (root instanceof HTMLDivElement && root.classList.contains("panel")) {
		return {
			panels: [{ div: root, children: buildChildren(root, labels) }],
			labels,
		};
	}
	if (root instanceof HTMLDivElement && root.classList.contains("label")) {
		labels.push(root);
		return { panels: [], labels };
	}
	return { panels: buildChildren(root, labels), labels };
}
