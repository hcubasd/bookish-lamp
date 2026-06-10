import { matchColors } from "miniature-waffle";
import { colorBg, squeezeFg } from "psychic-potato";
import { useEffect, useMemo, useState } from "react";
import extractPipelines from "../helpers/extractPipelines";
import getDeals from "../helpers/getDeals";
import getOpenPanelModel, { OPEN_MODES } from "../helpers/getOpenPanelModel";
import getRollingMonths from "../helpers/getRollingMonths";
import getWonHistory from "../helpers/getWonHistory";
import type { Deal } from "../types";
import HistorySection from "./HistorySection";
import Label from "./Label";
import OpenSection from "./OpenSection";

const lightness = 75;

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
	const [openModeIndex, setOpenModeIndex] = useState(() => {
		const saved = parseInt(localStorage.getItem("openModeIndex") ?? "", 10);
		return Number.isFinite(saved) && saved >= 0 && saved < OPEN_MODES.length
			? saved
			: 0;
	});
	const [deals, setDeals] = useState<Deal[]>([]);
	const [isPlaying, setIsPlaying] = useState(
		() => localStorage.getItem("isPlaying") === "true",
	);
	const months = useMemo(() => getRollingMonths(), []);

	useEffect(() => {
		getDeals().then(setDeals);
		const id = setInterval(() => {
			getDeals().then(setDeals);
		}, 60_000);
		return () => clearInterval(id);
	}, []);

	useEffect(() => {
		if (!isPlaying) return;
		const id = setInterval(() => {
			setOpenModeIndex((current) => (current + 1) % OPEN_MODES.length);
		}, 60_000);
		return () => clearInterval(id);
	}, [isPlaying]);

	useEffect(() => {
		localStorage.setItem("openModeIndex", String(openModeIndex));
	}, [openModeIndex]);

	useEffect(() => {
		localStorage.setItem("isPlaying", String(isPlaying));
	}, [isPlaying]);

	const pipelines = useMemo(() => extractPipelines(deals), [deals]);
	const palette = useMemo(() => {
		if (pipelines.length === 0) return [];
		const palettes = matchColors(pipelines.length, lightness);
		return palettes[Math.floor(Math.random() * palettes.length)] ?? [];
	}, [pipelines.length]);
	const pipelineColors = useMemo(
		() =>
			new Map(
				pipelines.map(
					(pipeline, index) =>
						[pipeline.id, toCssColor(palette[index])] as const,
				),
			),
		[palette, pipelines],
	);
	const wonHistory = useMemo(
		() => getWonHistory(deals, months, pipelines),
		[deals, months, pipelines],
	);
	const openPanel = useMemo(
		() =>
			getOpenPanelModel({
				deals,
				formatAmount: BRL.format,
				modeIndex: openModeIndex,
				pipelineColors,
				pipelines,
			}),
		[deals, openModeIndex, pipelineColors, pipelines],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: these are intentional triggers, not values read inside the effect
	useEffect(() => {
		const salesRoot = document.getElementById("sales-root");

		if (salesRoot instanceof HTMLDivElement) {
			colorBg(salesRoot, { startL: lightness, endL: 100 });
		} else {
			throw new Error("Sales root is not an instace of HTML div");
		}
	}, [openModeIndex, pipelines.length, deals]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: pipelines.length is an intentional trigger
	useEffect(() => {
		const salesRoot = document.getElementById("sales-root");

		if (!(salesRoot instanceof HTMLDivElement)) {
			throw new Error("Sales root is not an instace of HTML div");
		}

		function onResize() {
			const fontSize = squeezeFg(salesRoot);
			salesRoot.style.setProperty("--font-size", `${fontSize}px`);
			const h2 = salesRoot.querySelector("h2");
			if (h2) {
				const h2Margin = getComputedStyle(h2).marginBlockStart;
				if (h2Margin) salesRoot.style.setProperty("--h2-margin", h2Margin);
			}
			const h3 = salesRoot.querySelector("h3");
			if (h3) {
				const h3Margin = getComputedStyle(h3).marginBlockStart;
				if (h3Margin) salesRoot.style.setProperty("--h3-margin", h3Margin);
			}
		}
		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [pipelines.length]);
	return (
		<div
			id="sales-root"
			className="bg"
			style={{
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			<Label>
				<h1>Vendas</h1>
			</Label>
			<div className="bg oriented" style={{ flex: 1, minHeight: 0 }}>
				<HistorySection
					legendItems={pipelines.map((pipeline) => ({
						color: pipelineColors.get(pipeline.id) ?? "inherit",
						id: pipeline.id,
						title: pipeline.title,
					}))}
					maxMonthTotal={wonHistory.maxMonthTotal}
					months={months}
					monthColumns={wonHistory.monthTotals.map((total, monthIndex) => ({
						segments:
							wonHistory.monthStacks[monthIndex]?.map((segment) => ({
								color: pipelineColors.get(segment.pipelineId) ?? "inherit",
								key: `${months[monthIndex]?.key}-${segment.pipelineId}`,
								value: segment.value,
							})) ?? [],
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
					isPlaying={isPlaying}
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
					onPreviousMode={() =>
						setOpenModeIndex(
							(current) =>
								(current - 1 + OPEN_MODES.length) % OPEN_MODES.length,
						)
					}
					rowHeader={openPanel.rowHeader}
				/>
			</div>
		</div>
	);
}
