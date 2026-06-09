export default function OpenModeHeader({
	onNext,
	onPrevious,
}: {
	onNext: () => void;
	onPrevious: () => void;
}) {
	return (
		<div
			className="bg"
			style={{ justifyContent: "center", alignItems: "center" }}
		>
			<div
				className="fg"
				style={{
					display: "flex",
					gap: "var(--h2-margin, 0)",
					alignItems: "center",
				}}
			>
				<button type="button" style={{ fontSize: "inherit" }} onClick={onPrevious}>
					Anterior
				</button>
				<h2>Em andamento</h2>
				<button type="button" style={{ fontSize: "inherit" }} onClick={onNext}>
					Próximo
				</button>
			</div>
		</div>
	);
}
