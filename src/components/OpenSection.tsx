import OpenModeHeader from "./OpenModeHeader";
import OpenPipelineColumn from "./OpenPipelineColumn";

export default function OpenSection({
	pipelineTitle,
	rowHeader,
	total,
	rows,
}: {
	pipelineTitle: string;
	rowHeader: string;
	total: string;
	rows: Array<{ title: string; value: string }>;
}) {
	return (
		<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
			<OpenModeHeader />
			<div className="bg" style={{ flex: 1 }}>
				<OpenPipelineColumn
					title={pipelineTitle}
					header={rowHeader}
					total={total}
					rows={rows}
				/>
			</div>
		</div>
	);
}
