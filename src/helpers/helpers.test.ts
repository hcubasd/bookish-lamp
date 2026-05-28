import { describe, it, expect, beforeEach, vi } from "vitest";
import { getLightness } from "./applyColors";
import { divFinder } from "./divFinder";

// ─── getLightness ────────────────────────────────────────────────────────────

function makeLocalStorage() {
	const store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
	};
}

describe("getLightness", () => {
	beforeEach(() => vi.stubGlobal("localStorage", makeLocalStorage()));

	it("returns 75 and seeds localStorage when nothing is stored", () => {
		expect(getLightness()).toBe(75);
		expect(localStorage.getItem("lightness")).toBe("75");
	});

	it("returns the stored value", () => {
		localStorage.setItem("lightness", "50");
		expect(getLightness()).toBe(50);
	});

	it("accepts float values", () => {
		localStorage.setItem("lightness", "62.5");
		expect(getLightness()).toBe(62.5);
	});

	it("returns 75 and resets when the stored value is not a finite number", () => {
		localStorage.setItem("lightness", "not-a-number");
		expect(getLightness()).toBe(75);
		expect(localStorage.getItem("lightness")).toBe("75");
	});
});

// ─── divFinder ───────────────────────────────────────────────────────────────

function makePanel(...children: HTMLElement[]): HTMLDivElement {
	const div = document.createElement("div");
	div.className = "panel";
	children.forEach((c) => {
		div.appendChild(c);
	});
	return div;
}

function makeLabel(): HTMLDivElement {
	const div = document.createElement("div");
	div.className = "label";
	return div;
}

describe("divFinder", () => {
	it("wraps the root panel as the single top-level node", () => {
		const root = makePanel();
		const { panels, labels } = divFinder(root);
		expect(panels).toHaveLength(1);
		expect(panels[0].div).toBe(root);
		expect(labels).toHaveLength(0);
	});

	it("finds direct panel children as children of the root node", () => {
		const a = makePanel();
		const b = makePanel();
		const root = makePanel(a, b);
		const { panels } = divFinder(root);
		expect(panels[0].children).toHaveLength(2);
		expect(panels[0].children[0].div).toBe(a);
		expect(panels[0].children[1].div).toBe(b);
	});

	it("computes correct nesting depth", () => {
		const leaf = makePanel();
		const mid = makePanel(leaf);
		const root = makePanel(mid);
		const { panels } = divFinder(root);
		expect(panels[0].children[0].children[0].div).toBe(leaf);
	});

	it("collects label divs and excludes them from the panel tree", () => {
		const lbl = makeLabel();
		const root = makePanel(lbl);
		const { panels, labels } = divFinder(root);
		expect(panels[0].children).toHaveLength(0);
		expect(labels).toHaveLength(1);
		expect(labels[0]).toBe(lbl);
	});

	it("recurses through unclassed divs to surface panels inside them", () => {
		const inner = makePanel();
		const wrapper = document.createElement("div");
		wrapper.appendChild(inner);
		const root = makePanel(wrapper);
		const { panels } = divFinder(root);
		expect(panels[0].children).toHaveLength(1);
		expect(panels[0].children[0].div).toBe(inner);
	});

	it("treats a root label div as a label, not a panel", () => {
		const root = makeLabel();
		const { panels, labels } = divFinder(root);
		expect(panels).toHaveLength(0);
		expect(labels).toHaveLength(1);
		expect(labels[0]).toBe(root);
	});

	it("ignores non-div children", () => {
		const root = makePanel();
		const span = document.createElement("span");
		span.className = "panel";
		root.appendChild(span);
		const { panels } = divFinder(root);
		expect(panels[0].children).toHaveLength(0);
	});
});
