export default function AggregationRow({
	title,
	value,
}: {
	title: string;
	value: string;
}) {
	return (
		<div className="bg">
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
