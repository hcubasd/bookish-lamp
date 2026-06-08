import { matchColors } from "miniature-waffle";

export default function synchronizeSales() {
  const color = matchColors(1, 75)[Math.floor(Math.random() * 256)][0];
  const cssColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

  const pipelineHistory = document.getElementById("pipeline-history");
  if (!pipelineHistory) throw new Error("No pipeline history element found");
  pipelineHistory.style.color = cssColor;

  const pipelineLegend = document.getElementById("pipeline-legend");
  if (!pipelineLegend) throw new Error("No pipeline legend element found");
  pipelineLegend.style.color = cssColor;

  const pipelineBars = document.getElementsByClassName("pipeline-bar");
  if (!pipelineBars) throw new Error("No pipeline bar found");
  for (const pipelineBar of pipelineBars) {
    if (pipelineBar instanceof HTMLElement) {
      pipelineBar.style.backgroundColor = cssColor;
    }
  }

  const pipelineHeader = document.getElementById("pipeline-header");
  if (!pipelineHeader) throw new Error("No pipeline header element found");
  pipelineHeader.style.color = cssColor;
}
