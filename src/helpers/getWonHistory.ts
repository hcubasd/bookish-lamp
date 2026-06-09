import type { Deal, Pipeline } from "../types";
import type { RollingMonth } from "./getRollingMonths";

export interface WonHistoryMonthStack {
	pipelineId: string;
	value: number;
}

export interface WonHistoryPipelineRow {
	pipeline: Pipeline;
	totals: number[];
}

export interface WonHistoryModel {
	maxMonthTotal: number;
	monthStacks: WonHistoryMonthStack[][];
	monthTotals: number[];
	pipelineRows: WonHistoryPipelineRow[];
}

function getMonthKey(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function getWonHistory(
	deals: Deal[],
	months: RollingMonth[],
	pipelines: Pipeline[],
): WonHistoryModel {
	const monthIndexByKey = new Map(
		months.map((month, index) => [month.key, index] as const),
	);
	const pipelineIndexById = new Map(
		pipelines.map((pipeline, index) => [pipeline.id, index] as const),
	);

	const monthTotals = months.map(() => 0);
	const pipelineTotalsByMonth = pipelines.map(() => months.map(() => 0));

	for (const deal of deals) {
		if (
			deal.status !== "won" ||
			deal.closed_at === null ||
			deal.amount === null
		) {
			continue;
		}

		const monthIndex = monthIndexByKey.get(
			getMonthKey(new Date(deal.closed_at)),
		);
		const pipelineIndex = pipelineIndexById.get(deal.stage.pipeline.id);

		if (monthIndex === undefined || pipelineIndex === undefined) {
			continue;
		}

		monthTotals[monthIndex] += deal.amount;
		const pipelineRow = pipelineTotalsByMonth[pipelineIndex];
		if (pipelineRow !== undefined) {
			pipelineRow[monthIndex] += deal.amount;
		}
	}

	return {
		maxMonthTotal: Math.max(...monthTotals, 0),
		monthStacks: monthTotals.map((_, monthIndex) => {
			return pipelines
				.map((pipeline, pipelineIndex) => ({
					pipelineId: pipeline.id,
					value: pipelineTotalsByMonth[pipelineIndex]?.[monthIndex] ?? 0,
				}))
				.filter((segment) => segment.value > 0);
		}),
		monthTotals,
		pipelineRows: pipelines.map((pipeline, pipelineIndex) => ({
			pipeline,
			totals: pipelineTotalsByMonth[pipelineIndex] ?? [],
		})),
	};
}
