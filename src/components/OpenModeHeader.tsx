export default function OpenModeHeader() {
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
				<button type="button" style={{ fontSize: "inherit" }}>
					Anterior
				</button>
				<h2>Em andamento</h2>
				<button type="button" style={{ fontSize: "inherit" }}>
					Próximo
				</button>
			</div>
		</div>
	);
}
