import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findPalettes } from "miniature-waffle";
import { divFinder } from "../helpers/divFinder";
import { applyColors, getLightness } from "../helpers/applyColors";
import { applyText } from "../helpers/applyText";
import { getDeals } from "../helpers/getDeals";
import {
	formatTooltip,
	rowsByStage,
	rowsByOwner,
	rowsByOrganization,
	rowsByContact,
	rowsByProduct,
	rowsByCampaign,
	rowsBySource,
	rowsByTeam,
	rowsByIndustry,
} from "../helpers/aggregations";
import type { Deal, Pipeline } from "../types";

const ROW_MODES = [
	{ fn: rowsByStage, label: "Estágios" },
	{ fn: rowsByOwner, label: "Responsáveis" },
	{ fn: rowsByOrganization, label: "Clientes" },
	{ fn: rowsByContact, label: "Contatos" },
	{ fn: rowsByProduct, label: "Produtos" },
	{ fn: rowsByCampaign, label: "Campanhas" },
	{ fn: rowsBySource, label: "Origens" },
	{ fn: rowsByTeam, label: "Times" },
	{ fn: rowsByIndustry, label: "Segmentos dos Clientes" },
];

function computeMonths(): Date[] {
	const now = new Date();
	return Array.from(
		{ length: 12 },
		(_, i) => new Date(now.getFullYear(), now.getMonth() - 11 + i, 1),
	);
}

function formatMonth(date: Date, isFirst: boolean): string {
	if (isFirst || date.getMonth() === 0) {
		const short = date.toLocaleString(undefined, { month: "short" });
		const year = String(date.getFullYear()).slice(-2);
		return `${short}/${year}`;
	}
	return date.toLocaleString(undefined, { month: "long" });
}

function extractPipelines(deals: Deal[]): Pipeline[] {
	const seen = new Map<string, Pipeline>();
	for (const deal of deals) {
		const p = deal.stage.pipeline;
		if (!seen.has(p.id)) seen.set(p.id, p);
	}
	return [...seen.values()].sort((a, b) => a.display_order - b.display_order);
}

function computeMonthTotal(
	deals: Deal[],
	pipelineId: string,
	month: Date,
): number {
	return deals.reduce((sum, d) => {
		if (
			d.status !== "won" ||
			d.closed_at === null ||
			d.amount === null ||
			d.stage.pipeline.id !== pipelineId
		)
			return sum;
		const closed = new Date(d.closed_at);
		if (
			closed.getFullYear() === month.getFullYear() &&
			closed.getMonth() === month.getMonth()
		) {
			return sum + d.amount;
		}
		return sum;
	}, 0);
}

const BRL = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});
const months = computeMonths();

export default function Sales() {
	const navigate = useNavigate();
	const rootRef = useRef<HTMLDivElement>(null);
	const squeezedModeRef = useRef<number>(-1);
	const [deals, setDeals] = useState<Deal[]>([]);
	const [modeIndex, setModeIndex] = useState(() => {
		const v = Number(localStorage.getItem("modeIndex") ?? "0");
		return v >= 0 && v < ROW_MODES.length ? v : 0;
	});

	useEffect(() => {
		getDeals().then(setDeals);
		const automation = Number(localStorage.getItem("automation") ?? "0");
		const intervalMs = Math.max(60, automation) * 1000;
		const id = setInterval(() => {
			getDeals().then(setDeals);
		}, intervalMs);
		return () => clearInterval(id);
	}, []);

	useEffect(() => {
		localStorage.setItem("modeIndex", String(modeIndex));
	}, [modeIndex]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: modeIndex resets the timeout on each cycle
	useEffect(() => {
		const seconds = Number(localStorage.getItem("automation") ?? "0");
		if (seconds <= 0) return;
		const id = setTimeout(() => {
			setModeIndex((i) => (i + 1) % ROW_MODES.length);
		}, seconds * 1000);
		return () => clearTimeout(id);
	}, [modeIndex]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: modeIndex and deals trigger recolor when panels change
	useEffect(() => {
		if (!rootRef.current) return;
		const found = divFinder(rootRef.current);
		applyColors(found);
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onTheme = () => {
			if (!rootRef.current) return;
			applyColors(divFinder(rootRef.current));
		};
		mq.addEventListener("change", onTheme);
		return () => mq.removeEventListener("change", onTheme);
	}, [modeIndex, deals]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: squeezes once per mode after data is available
	useLayoutEffect(() => {
		if (!rootRef.current || deals.length === 0) return;
		if (squeezedModeRef.current === modeIndex) return;
		squeezedModeRef.current = modeIndex;
		try {
			applyText(divFinder(rootRef.current));
		} catch {
			// squeezeText can fail if container dims aren't ready yet
		}
	}, [deals, modeIndex]);

	useEffect(() => {
		const onResize = () => {
			if (!rootRef.current) return;
			try {
				applyText(divFinder(rootRef.current));
			} catch {
				// ignore
			}
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	const pipelines = extractPipelines(deals);
	let palette: [number, number, number][] = [];
	if (pipelines.length > 0) {
		const L = getLightness();
		const variation = Math.max(
			1,
			Math.min(256, parseInt(localStorage.getItem("variation") ?? "1", 10)),
		);
		palette = findPalettes(L, pipelines.length)[variation - 1];
	}

	const monthTotals = months.map((m) =>
		pipelines.reduce((sum, p) => sum + computeMonthTotal(deals, p.id, m), 0),
	);
	const maxMonthTotal = Math.max(...monthTotals, 0);

	const { fn: rowFn, label: modeLabel } = ROW_MODES[modeIndex];
	const pipelineTotals = pipelines.map((p) =>
		deals
			.filter((d) => d.status === "ongoing" && d.stage.pipeline.id === p.id)
			.reduce((s, d) => s + (d.amount ?? 0), 0),
	);
	const rowsPerPipeline = pipelines.map((p) => rowFn(deals, p.id));

	return (
		<div
			ref={rootRef}
			className="panel"
			style={{ flexDirection: "column", height: "100%" }}
		>
			<div className="label">
				<span>
					<button
						onClick={() => navigate("/settings")}
						type="button"
						style={{
							display: "inline",
							background: "none",
							border: "none",
							padding: 0,
							font: "inherit",
							color: "inherit",
							cursor: "pointer",
						}}
					>
						{"<"}
					</button>{" "}
					<span>Vendas</span>{" "}
					<button
						onClick={() => navigate("/settings")}
						type="button"
						style={{
							display: "inline",
							background: "none",
							border: "none",
							padding: 0,
							font: "inherit",
							color: "inherit",
							cursor: "pointer",
						}}
					>
						{">"}
					</button>
				</span>
			</div>
			<div className="panel" style={{ flexDirection: "column", flex: 1 }}>
				<div className="panel" style={{ flexDirection: "column", flex: 1 }}>
					<div className="label">
						<span>Realizadas</span>
					</div>
					<div className="panel" style={{ flex: 1, flexDirection: "column" }}>
						<div className="panel" style={{ flex: 1, flexDirection: "column" }}>
							{pipelines.length > 0 && (
								<div className="label">
									<span>
										{pipelines.map((p, i) => {
											const [r, g, b] = palette[i];
											return (
												<span
													key={p.id}
													style={{ color: `rgb(${r},${g},${b})` }}
												>
													{`• ${p.title}${i < pipelines.length - 1 ? " " : ""}`}
												</span>
											);
										})}
									</span>
								</div>
							)}
							<div className="front-panel" style={{ flex: 1 }}>
								{months.map((m, i) => {
									const monthTotal = monthTotals[i];
									return (
										<div
											key={m.toISOString()}
											style={{
												flex: 1,
												minWidth: 0,
												display: "flex",
												flexDirection: "column",
												gap: "var(--gap)",
											}}
										>
											{monthTotal > 0 && (
												<>
													<div
														style={{
															flex: maxMonthTotal - monthTotal,
															minHeight: 0,
														}}
													/>
													<div className="label">
														<span>{BRL.format(monthTotal)}</span>
													</div>
													<div
														style={{
															flex: monthTotal,
															display: "flex",
															flexDirection: "column",
														}}
													>
														{pipelines.map((p, pi) => {
															const pTotal = computeMonthTotal(deals, p.id, m);
															if (pTotal === 0) return null;
															const [r, g, b] = palette[pi];
															return (
																<div
																	key={p.id}
																	style={{
																		flex: pTotal,
																		backgroundColor: `rgb(${r},${g},${b})`,
																	}}
																/>
															);
														})}
													</div>
												</>
											)}
										</div>
									);
								})}
							</div>
						</div>
						<div className="panel">
							{months.map((m, i) => (
								<div
									key={m.toISOString()}
									className="label"
									style={{ flex: 1 }}
								>
									<span>{formatMonth(m, i === 0)}</span>
								</div>
							))}
						</div>
						<div className="panel" style={{ flexDirection: "column" }}>
							{pipelines.map((p, i) => {
								const [r, g, b] = palette[i];
								return (
									<div key={p.id} className="panel">
										{months.map((m) => {
											const total = computeMonthTotal(deals, p.id, m);
											return (
												<div
													key={m.toISOString()}
													className="label"
													style={{ flex: 1 }}
												>
													<span style={{ color: `rgb(${r},${g},${b})` }}>
														{BRL.format(total)}
													</span>
												</div>
											);
										})}
									</div>
								);
							})}
						</div>
					</div>
				</div>
				<div className="panel" style={{ flexDirection: "column", flex: 1 }}>
					<div className="label">
						<span>
							<button
								onClick={() =>
									setModeIndex(
										(i) => (i - 1 + ROW_MODES.length) % ROW_MODES.length,
									)
								}
								type="button"
								style={{
									display: "inline",
									background: "none",
									border: "none",
									padding: 0,
									font: "inherit",
									color: "inherit",
									cursor: "pointer",
								}}
							>
								{"<"}
							</button>{" "}
							<span>Em andamento</span>{" "}
							<button
								onClick={() => setModeIndex((i) => (i + 1) % ROW_MODES.length)}
								type="button"
								style={{
									display: "inline",
									background: "none",
									border: "none",
									padding: 0,
									font: "inherit",
									color: "inherit",
									cursor: "pointer",
								}}
							>
								{">"}
							</button>
						</span>
					</div>
					<div className="panel" style={{ flex: 1 }}>
						{pipelines.map((p, pi) => {
							const [r, g, b] = palette[pi];
							const rows = rowsPerPipeline[pi];
							const total = pipelineTotals[pi];
							const MAX_KEY_LEN = 22;
							const truncate = (s: string) =>
								s.length > MAX_KEY_LEN
									? `${s.slice(0, MAX_KEY_LEN - 1)}…`
									: s;
							const maxTitleLen = Math.max(
								modeLabel.length,
								...rows.map((row) => Math.min(row.title.length, MAX_KEY_LEN)),
							);
							const maxValLen = Math.max(
								BRL.format(total).length,
								...rows.map((row) => BRL.format(row.amount).length),
							);
							return (
								<div
									key={p.id}
									className="panel"
									style={{ flex: 1, minWidth: 0, flexDirection: "column" }}
								>
									<div className="label">
										<span style={{ color: `rgb(${r},${g},${b})` }}>
											{p.title}
										</span>
									</div>
									<div
										className="panel"
										style={{ flex: 1, flexDirection: "column" }}
									>
										<div className="label" style={{ whiteSpace: "pre" }}>
											<span style={{ fontWeight: "bold" }}>
												{`${modeLabel.padStart(maxTitleLen)} ${BRL.format(total).padEnd(maxValLen)}`}
											</span>
										</div>
										<div
											className="panel"
											style={{
												flex: 1,
												minHeight: 0,
												flexDirection: "column",
												overflowY: "auto",
												scrollbarGutter: "stable",
											}}
										>
											{rows.map((row) => (
												<div
													key={row.id}
													className="label"
							style={{ whiteSpace: "pre", flexShrink: 0 }}
													title={formatTooltip(row.source)}
												>
													<span>{`${truncate(row.title).padStart(maxTitleLen)} ${BRL.format(row.amount).padEnd(maxValLen)}`}</span>
												</div>
											))}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
