import { findPalettes } from "miniature-waffle";
import { getLightness } from "./applyColors";

export function setupPaletteControls(
	variationSlider: HTMLInputElement,
	colorDivs: HTMLDivElement[],
): { cleanup: () => void; reapply: () => void } {
	let variation = parseInt(localStorage.getItem("variation") ?? "1", 10);
	if (variation < 1 || variation > 256) variation = 1;

	variationSlider.min = "1";
	variationSlider.max = "256";
	variationSlider.step = "1";
	variationSlider.value = String(variation);

	function reapply() {
		const L = getLightness();
		const palettes = findPalettes(L, 3);
		const palette = palettes[variation - 1];
		colorDivs.forEach((div, i) => {
			const [r, g, b] = palette[i];
			div.style.backgroundColor = `rgb(${r},${g},${b})`;
		});
	}

	reapply();

	function onVariation() {
		variation = parseInt(variationSlider.value, 10);
		localStorage.setItem("variation", String(variation));
		reapply();
	}

	variationSlider.addEventListener("input", onVariation);

	return {
		cleanup: () => variationSlider.removeEventListener("input", onVariation),
		reapply,
	};
}
