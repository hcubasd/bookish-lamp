import Label from "./Label";

export default function HistoryPipelineTotalsRow({
	color,
	values,
	id,
}: {
	color: string;
	values: string[];
	id?: string;
}) {
	return (
		<div id={id} className="bg">
			{values.map((value, index) => (
				<Label key={`${value}-${index}`} style={{ flex: 1 }}>
					<span style={{ color }}>{value}</span>
				</Label>
			))}
		</div>
	);
}
