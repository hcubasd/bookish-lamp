import AggregationRow from "./AggregationRow";
import Label from "./Label";

export default function OpenPipelineColumn({
	title,
	header,
	total,
	rows,
}: {
	title: string;
	header: string;
	total: string;
	rows: Array<{ title: string; value: string }>;
}) {
	return (
		<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
			<Label id="pipeline-header">
				<h3>{title}</h3>
			</Label>
			<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
				<div className="bg">
					<Label style={{ flex: 1 }}>{header}</Label>
					<Label style={{ flex: 1 }}>{total}</Label>
				</div>
				<div
					className="bg"
					style={{
						flex: 1,
						flexDirection: "column",
						overflowY: "auto",
						minHeight: 0,
					}}
				>
					{rows.map((row, index) => (
						<AggregationRow
							key={`${row.title}-${index}`}
							title={row.title}
							value={row.value}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
