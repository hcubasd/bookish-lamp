import Label from "./Label";

export interface HistoryMonthSegment {
	color: string;
	key: string;
	value: number;
}

export default function HistoryMonthColumn({
	maxTotal,
	segments,
	total,
	totalLabel,
}: {
	maxTotal: number;
	segments: HistoryMonthSegment[];
	total: number;
	totalLabel: string;
}) {
	return (
		<div
			style={{
				flex: 1,
				minWidth: 0,
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					minHeight: 0,
				}}
			>
				{total > 0 ? (
					<>
						<div style={{ flex: maxTotal - total, minHeight: 0 }} />
						<Label>{totalLabel}</Label>
						<div
							style={{
								flex: total,
								display: "flex",
								flexDirection: "column",
								minHeight: 0,
								marginTop: "1px",
							}}
						>
							{segments.map((segment) => (
								<div
									key={segment.key}
									className="pipeline-bar"
									style={{
										flex: segment.value,
										minHeight: 0,
										backgroundColor: segment.color,
									}}
								/>
							))}
						</div>
					</>
				) : (
					<div style={{ flex: 1 }} />
				)}
			</div>
		</div>
	);
}
