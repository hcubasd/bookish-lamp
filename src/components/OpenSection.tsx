import OpenModeHeader from "./OpenModeHeader";
import OpenPipelineColumn from "./OpenPipelineColumn";

export default function OpenSection({
	columns,
	onNextMode,
	onPreviousMode,
	rowHeader,
}: {
	columns: Array<{
		color: string;
		id: string;
		rows: Array<{ id: string; title: string; value: string }>;
		title: string;
		total: string;
	}>;
	onNextMode: () => void;
	onPreviousMode: () => void;
	rowHeader: string;
}) {
	return (
		<div
			className="bg"
			style={{ flex: 1, flexDirection: "column", minHeight: 0 }}
		>
			<OpenModeHeader onNext={onNextMode} onPrevious={onPreviousMode} />
			<div className="bg" style={{ flex: 1, minHeight: 0 }}>
				{columns.map((column) => (
					<OpenPipelineColumn
						key={column.id}
						color={column.color}
						title={column.title}
						header={rowHeader}
						total={column.total}
						rows={column.rows}
					/>
				))}
			</div>
		</div>
	);
}
