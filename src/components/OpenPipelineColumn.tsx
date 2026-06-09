import AggregationRow from "./AggregationRow";
import Label from "./Label";

export default function OpenPipelineColumn({
	color,
	title,
	header,
	total,
	rows,
}: {
	color: string;
	title: string;
	header: string;
	total: string;
	rows: Array<{ id: string; title: string; value: string; tooltip: string }>;
}) {
	return (
		<div
			className="bg"
			style={{ flex: 1, flexDirection: "column", overflow: "hidden" }}
		>
			<Label>
				<h3 style={{ color }}>{title}</h3>
			</Label>
			<div
				className="bg"
				style={{ flex: 1, flexDirection: "column", overflow: "hidden" }}
			>
				<div className="bg">
					<div
						className="bg"
						style={{
							flex: 1,
							justifyContent: "flex-start",
							overflowX: "auto",
						}}
					>
						<b className="cell" style={{ whiteSpace: "nowrap" }}>
							{header}
						</b>
					</div>
					<Label style={{ flex: 1, justifyContent: "flex-end" }}>
						<b>{total}</b>
					</Label>
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
					{rows.map((row) => (
						<AggregationRow
							key={row.id}
							title={row.title}
							value={row.value}
							tooltip={row.tooltip}
						/>
					))}
					{/* keeps colorBg maxDepth stable when rows is empty */}
					<div className="bg" style={{ display: "none" }}>
						<div className="bg" />
						<div className="bg" />
					</div>
				</div>
			</div>
		</div>
	);
}
