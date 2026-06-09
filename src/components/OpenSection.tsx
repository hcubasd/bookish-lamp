import OpenModeHeader from "./OpenModeHeader";
import OpenPipelineColumn from "./OpenPipelineColumn";

export default function OpenSection({
	columns,
	isPlaying,
	onPlay,
	onPause,
	onPreviousMode,
	rowHeader,
}: {
	columns: Array<{
		color: string;
		id: string;
		rows: Array<{ id: string; title: string; value: string; tooltip: string }>;
		title: string;
		total: string;
	}>;
	isPlaying: boolean;
	onPlay: () => void;
	onPause: () => void;
	onPreviousMode: () => void;
	rowHeader: string;
}) {
	return (
		<div
			className="bg"
			style={{ flex: 1, flexDirection: "column", minHeight: 0 }}
		>
			<OpenModeHeader
				isPlaying={isPlaying}
				onPlay={onPlay}
				onPause={onPause}
				onPrevious={onPreviousMode}
			/>
			<div
				className="bg"
				style={{ flex: 1, flexDirection: "column", minHeight: 0 }}
			>
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
