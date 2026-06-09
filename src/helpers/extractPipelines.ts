import type { Deal, Pipeline } from "../types";

export default function extractPipelines(deals: Deal[]): Pipeline[] {
	const seen = new Map<string, Pipeline>();

	for (const deal of deals) {
		const pipeline = deal.stage.pipeline;
		if (!seen.has(pipeline.id)) {
			seen.set(pipeline.id, pipeline);
		}
	}

	return [...seen.values()].sort((left, right) => {
		return left.display_order - right.display_order;
	});
}
