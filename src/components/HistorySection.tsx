import { Fragment } from "react";
import type { HistoryMonthSegment } from "./HistoryMonthColumn";
import type { RollingMonth } from "../helpers/getRollingMonths";
import Label from "./Label";
import HistoryMonthColumn from "./HistoryMonthColumn";
import HistoryMonthLabelsRow from "./HistoryMonthLabelsRow";
import HistoryPipelineTotalsRow from "./HistoryPipelineTotalsRow";

export default function HistorySection({
	legendItems,
	maxMonthTotal,
	months,
	monthColumns,
	pipelineRows,
}: {
	legendItems: Array<{ color: string; id: string; title: string }>;
	maxMonthTotal: number;
	months: RollingMonth[];
	monthColumns: Array<{
		segments: HistoryMonthSegment[];
		total: number;
		totalLabel: string;
	}>;
	pipelineRows: Array<{ color: string; id: string; values: string[] }>;
}) {
	return (
		<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
			<Label style={{ width: "100%" }}>
				<h2>Histórico</h2>
			</Label>
			<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
				<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
					<Label>
						<span id="pipeline-legend">
							{legendItems.map((item, index) => (
								<Fragment key={item.id}>
									<span style={{ color: item.color }}>
										{item.title}
									</span>
									{index < legendItems.length - 1 ? <span> </span> : null}
								</Fragment>
							))}
						</span>
					</Label>
					<div className="bg" style={{ flex: 1 }}>
						{months.map((month, index) => (
							<HistoryMonthColumn
								key={month.key}
								maxTotal={maxMonthTotal}
								segments={monthColumns[index]?.segments ?? []}
								total={monthColumns[index]?.total ?? 0}
								totalLabel={monthColumns[index]?.totalLabel ?? ""}
							/>
						))}
					</div>
				</div>
				<HistoryMonthLabelsRow months={months} />
				<div id="pipeline-history" className="bg" style={{ flexDirection: "column" }}>
					{pipelineRows.map((row) => (
						<HistoryPipelineTotalsRow
							key={row.id}
							color={row.color}
							values={row.values}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
