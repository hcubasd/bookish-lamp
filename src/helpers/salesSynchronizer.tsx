import { matchColors } from "miniature-waffle";

export default function synchronizeSales() {
	const color = matchColors(1, 75)[Math.floor(Math.random() * 256)][0];
	const cssColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

	const pipelineHeader = document.getElementById("pipeline-header");
	if (!pipelineHeader) throw new Error("No pipeline header element found");
	pipelineHeader.style.color = cssColor;
}
