export default function AggregationRow({
	title,
	value,
	tooltip,
}: {
	title: string;
	value: string;
	tooltip: string;
}) {
	return (
		<div className="bg" title={tooltip}>
			<div
				className="bg"
				style={{
					flex: 1,
					justifyContent: "flex-start",
					overflowX: "auto",
				}}
			>
				<span
					className="cell"
					style={{
						whiteSpace: "nowrap",
					}}
				>
					{title}
				</span>
			</div>
			<div
				className="bg"
				style={{
					flex: 1,
					justifyContent: "flex-end",
				}}
			>
				<div
					className="cell"
					style={{
						whiteSpace: "nowrap",
					}}
				>
					{value}
				</div>
			</div>
		</div>
	);
}
