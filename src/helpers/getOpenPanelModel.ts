import type { Deal, Pipeline } from "../types";
import {
	type AggregationRowData,
	rowsByCampaign,
	rowsByContact,
	rowsByIndustry,
	rowsByOrganization,
	rowsByOwner,
	rowsByProduct,
	rowsBySource,
	rowsByStage,
	rowsByTask,
	rowsByTeam,
} from "./aggregations";

export interface OpenMode {
	header: string;
	rows: (deals: Deal[], pipelineId: string) => AggregationRowData[];
}

export interface OpenPipelineColumnModel {
	color: string;
	id: string;
	rows: Array<{ id: string; title: string; value: string; tooltip: string }>;
	title: string;
	total: string;
}

export interface OpenPanelModel {
	columns: OpenPipelineColumnModel[];
	rowHeader: string;
}

export const OPEN_MODES: OpenMode[] = [
	{ rows: rowsByStage, header: "Estágio" },
	{ rows: rowsByOwner, header: "Responsável" },
	{ rows: rowsByOrganization, header: "Cliente" },
	{ rows: rowsByContact, header: "Contato" },
	{ rows: rowsByProduct, header: "Produto" },
	{ rows: rowsByCampaign, header: "Campanha" },
	{ rows: rowsBySource, header: "Origem" },
	{ rows: rowsByTeam, header: "Time" },
	{ rows: rowsByIndustry, header: "Segmento" },
	{ rows: rowsByTask, header: "Tarefa" },
];

export default function getOpenPanelModel({
	deals,
	formatAmount,
	modeIndex,
	pipelineColors,
	pipelines,
}: {
	deals: Deal[];
	formatAmount: (amount: number) => string;
	modeIndex: number;
	pipelineColors: Map<string, string>;
	pipelines: Pipeline[];
}): OpenPanelModel {
	const mode = OPEN_MODES[modeIndex] ?? OPEN_MODES[0];
	if (!mode) throw new Error("OPEN_MODES is empty");

	return {
		rowHeader: mode.header,
		columns: pipelines.map((pipeline) => {
			const rows = mode.rows(deals, pipeline.id);
			const totalAmount = deals
				.filter(
					(deal) =>
						deal.status === "ongoing" && deal.stage.pipeline.id === pipeline.id,
				)
				.reduce((sum, deal) => sum + (deal.amount ?? 0), 0);

			return {
				color: pipelineColors.get(pipeline.id) ?? "inherit",
				id: pipeline.id,
				rows: rows.map((row) => ({
					id: row.id,
					title: row.title,
					value: formatAmount(row.amount),
					tooltip: row.tooltip,
				})),
				title: pipeline.title,
				total: formatAmount(totalAmount),
			};
		}),
	};
}
