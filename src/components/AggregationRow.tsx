import Label from "./Label";

export default function AggregationRow({
	title,
	value,
}: {
	title: string;
	value: string;
}) {
	return (
		<div className="bg">
			<div className="bg" style={{ flex: 1 }}>
				<div
					className="cell"
					style={{
						flex: 1,
						overflowX: "auto",
						minWidth: 0,
					}}
				>
					{title}
				</div>
			</div>
			<Label style={{ flex: 1 }}>{value}</Label>
		</div>
	);
}
