import { matchColors } from "miniature-waffle";
import { colorBg, squeezeFg } from "psychic-potato";
import { useEffect, useMemo } from "react";
import extractPipelines from "../helpers/extractPipelines";
import getRollingMonths from "../helpers/getRollingMonths";
import getWonHistory from "../helpers/getWonHistory";
import synchronizeSales from "../helpers/salesSynchronizer";
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

	useEffect(() => {
		const salesRoot = document.getElementById("sales-root");

		if (salesRoot instanceof HTMLDivElement) {
			colorBg(salesRoot, { startL: 75, endL: 100 });
		} else {
			throw new Error("Sales root is not an instace of HTML div");
		}

		function onResize() {
			if (salesRoot instanceof HTMLDivElement) {
				const fontSize = squeezeFg(salesRoot);
				salesRoot.style.setProperty("--font-size", `${fontSize}px`);
				const h2 = salesRoot.querySelector("h2");
				if (!h2) throw new Error("No h2 element found in sales root");
				const h2Margin = getComputedStyle(h2).marginBlockStart;
				if (!h2Margin) throw new Error("No h2 margin found");
				salesRoot.style.setProperty("--h2-margin", h2Margin);
			} else {
				throw new Error("Sales root is not an instace of HTML div");
			}
		}

		onResize();
		window.addEventListener("resize", onResize);

		synchronizeSales();
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
					pipelineTitle="Pipeline"
					rowHeader="Stage"
					total="0"
					rows={[{ title: "Awareness", value: "0" }]}
				/>
			</div>
		</div>
	);
}
