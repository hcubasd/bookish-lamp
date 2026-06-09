import { describe, expect, it } from "vitest";
import { mockDeals } from "../mocks";
import extractPipelines from "./extractPipelines";
import getOpenPanelModel from "./getOpenPanelModel";

describe("getOpenPanelModel", () => {
	it("builds one column per pipeline for the selected mode", () => {
		const pipelines = extractPipelines(mockDeals);
		const pipelineColors = new Map(
			pipelines.map((pipeline) => [pipeline.id, "rgb(1, 2, 3)"] as const),
		);

		const model = getOpenPanelModel({
			deals: mockDeals,
			formatAmount: (amount) => String(amount),
			modeIndex: 0,
			pipelineColors,
			pipelines,
		});

		expect(model.rowHeader).toBe("Estágio");
		expect(model.columns).toHaveLength(pipelines.length);
		expect(model.columns[0]?.title).toBe(pipelines[0]?.title);
		expect(model.columns[0]?.color).toBe("rgb(1, 2, 3)");
	});
});
