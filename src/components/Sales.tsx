import { matchColors } from "miniature-waffle";
import { colorBg, squeezeFg } from "psychic-potato";
import { useEffect, useMemo, useState } from "react";
import extractPipelines from "../helpers/extractPipelines";
import getOpenPanelModel, { OPEN_MODES } from "../helpers/getOpenPanelModel";
import getRollingMonths from "../helpers/getRollingMonths";
import getWonHistory from "../helpers/getWonHistory";
import { mockDeals } from "../mocks";
import HistorySection from "./HistorySection";
import Label from "./Label";
import OpenSection from "./OpenSection";

const BRL = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

function toCssColor(
	color: { r: number; g: number; b: number } | undefined,
): string {
	if (!color) return "inherit";
	return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export default function Sales() {
	const [openModeIndex, setOpenModeIndex] = useState(0);
	const months = useMemo(() => getRollingMonths(), []);
	const pipelines = useMemo(() => extractPipelines(mockDeals), []);
	const palette = useMemo(() => {
		if (pipelines.length === 0) return [];
		const palettes = matchColors(pipelines.length, 75);
		return palettes[Math.floor(Math.random() * palettes.length)] ?? [];
	}, [pipelines]);
	const pipelineColors = useMemo(
		() =>
			new Map(
				pipelines.map((pipeline, index) => [
					pipeline.id,
					toCssColor(palette[index]),
				] as const),
			),
		[palette, pipelines],
	);
	const wonHistory = useMemo(
		() => getWonHistory(mockDeals, months, pipelines),
		[months, pipelines],
	);
	const openPanel = useMemo(
		() =>
			getOpenPanelModel({
				deals: mockDeals,
				formatAmount: BRL.format,
				modeIndex: openModeIndex,
				pipelineColors,
				pipelines,
			}),
		[openModeIndex, pipelineColors, pipelines],
	);

	useEffect(() => {
		const salesRoot = document.getElementById("sales-root");

		if (salesRoot instanceof HTMLDivElement) {
			colorBg(salesRoot, { startL: 75, endL: 100 });
		} else {
			throw new Error("Sales root is not an instace of HTML div");
		}
	}, [openModeIndex]);

	useEffect(() => {
		const salesRoot = document.getElementById("sales-root");

		if (!(salesRoot instanceof HTMLDivElement)) {
			throw new Error("Sales root is not an instace of HTML div");
		}

		function onResize() {
			const fontSize = squeezeFg(salesRoot);
			salesRoot.style.setProperty("--font-size", `${fontSize}px`);
			const h2 = salesRoot.querySelector("h2");
			if (!h2) throw new Error("No h2 element found in sales root");
			const h2Margin = getComputedStyle(h2).marginBlockStart;
			if (!h2Margin) throw new Error("No h2 margin found");
			salesRoot.style.setProperty("--h2-margin", h2Margin);
			const h3 = salesRoot.querySelector("h3");
			if (!h3) throw new Error("No h3 element found in sales root");
			const h3Margin = getComputedStyle(h3).marginBlockStart;
			if (!h3Margin) throw new Error("No h3 margin found");
			salesRoot.style.setProperty("--h3-margin", h3Margin);
		}
		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);
	return (
		<div
			id="sales-root"
			className="bg"
			style={{ flexDirection: "column", height: "100%" }}
		>
			<Label style={{ width: "100%" }}>
				<h1>Vendas</h1>
			</Label>
			<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
				<HistorySection
					legendItems={pipelines.map((pipeline) => ({
						color: pipelineColors.get(pipeline.id) ?? "inherit",
						id: pipeline.id,
						title: pipeline.title,
					}))}
					maxMonthTotal={wonHistory.maxMonthTotal}
					months={months}
					monthColumns={wonHistory.monthTotals.map((total, monthIndex) => ({
						segments: wonHistory.monthStacks[monthIndex]!.map((segment) => ({
							color: pipelineColors.get(segment.pipelineId) ?? "inherit",
							key: `${months[monthIndex]!.key}-${segment.pipelineId}`,
							value: segment.value,
						})),
						total,
						totalLabel: BRL.format(total),
					}))}
					pipelineRows={wonHistory.pipelineRows.map((row) => ({
						color: pipelineColors.get(row.pipeline.id) ?? "inherit",
						id: row.pipeline.id,
						values: row.totals.map((total) => BRL.format(total)),
					}))}
				/>
				<OpenSection
					columns={openPanel.columns}
					onNextMode={() =>
						setOpenModeIndex((current) => (current + 1) % OPEN_MODES.length)
					}
					onPreviousMode={() =>
						setOpenModeIndex(
							(current) => (current - 1 + OPEN_MODES.length) % OPEN_MODES.length,
						)
					}
					rowHeader={openPanel.rowHeader}
				/>
			</div>
		</div>
	);
}
