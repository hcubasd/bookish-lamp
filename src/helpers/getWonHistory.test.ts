import { describe, expect, it } from "vitest";
import type { Deal, Pipeline } from "../types";
import getRollingMonths from "./getRollingMonths";
import getWonHistory from "./getWonHistory";

function createPipeline(
	id: string,
	title: string,
	displayOrder: number,
): Pipeline {
	return {
		id,
		title,
		display_order: displayOrder,
		created_at: "2026-01-01T00:00:00Z",
		updated_at: "2026-01-01T00:00:00Z",
	};
}

function createDeal({
	id,
	pipeline,
	status,
	amount,
	closedAt,
}: {
	id: string;
	pipeline: Pipeline;
	status: Deal["status"];
	amount: number | null;
	closedAt: string | null;
}): Deal {
	return {
		id,
		title: id,
		stage: {
			id: `${pipeline.id}-stage`,
			title: "Stage",
			description: null,
			objective: null,
			display_order: 1,
			pipeline,
			created_at: "2026-01-01T00:00:00Z",
			updated_at: "2026-01-01T00:00:00Z",
		},
		owner: null,
		source: null,
		campaign: null,
		loss_reason: null,
		organization: null,
		amount,
		expected_close_date: null,
		rating: null,
		status,
		closed_at: closedAt,
		contacts: [],
		products: [],
		tasks: [],
		created_at: "2026-01-01T00:00:00Z",
		updated_at: "2026-01-01T00:00:00Z",
	};
}

describe("getWonHistory", () => {
	it("aggregates won amounts by month and pipeline", () => {
		const pipelineA = createPipeline("a", "A", 1);
		const pipelineB = createPipeline("b", "B", 2);
		const months = getRollingMonths(new Date(2026, 5, 8));

		const history = getWonHistory(
			[
				createDeal({
					id: "won-a-july",
					pipeline: pipelineA,
					status: "won",
					amount: 100,
					closedAt: "2025-07-15T00:00:00Z",
				}),
				createDeal({
					id: "won-b-july",
					pipeline: pipelineB,
					status: "won",
					amount: 50,
					closedAt: "2025-07-20T00:00:00Z",
				}),
				createDeal({
					id: "won-a-june",
					pipeline: pipelineA,
					status: "won",
					amount: 30,
					closedAt: "2026-06-01T00:00:00Z",
				}),
				createDeal({
					id: "lost-a-june",
					pipeline: pipelineA,
					status: "lost",
					amount: 999,
					closedAt: "2026-06-05T00:00:00Z",
				}),
			],
			months,
			[pipelineA, pipelineB],
		);

		expect(history.monthTotals[0]).toBe(150);
		expect(history.monthTotals[11]).toBe(30);
		expect(history.maxMonthTotal).toBe(150);
		expect(history.pipelineRows[0]?.totals[0]).toBe(100);
		expect(history.pipelineRows[1]?.totals[0]).toBe(50);
		expect(history.monthStacks[0]).toEqual([
			{ pipelineId: "a", value: 100 },
			{ pipelineId: "b", value: 50 },
		]);
	});
});
