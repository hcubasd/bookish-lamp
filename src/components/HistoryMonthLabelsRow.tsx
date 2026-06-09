import type { RollingMonth } from "../helpers/getRollingMonths";
import Label from "./Label";

export default function HistoryMonthLabelsRow({
	months,
}: {
	months: RollingMonth[];
}) {
	return (
		<div className="bg">
			{months.map((month) => (
				<Label key={month.key} style={{ flex: 1 }}>
					<h3>{month.label}</h3>
				</Label>
			))}
		</div>
	);
}
