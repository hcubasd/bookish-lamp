export default function OpenModeHeader({
	isPlaying,
	onPlay,
	onPause,
	onPrevious,
}: {
	isPlaying: boolean;
	onPlay: () => void;
	onPause: () => void;
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
				<button
					type="button"
					style={{ fontSize: "inherit" }}
					onClick={onPrevious}
				>
					{"◀"}
				</button>
				<h2>Em andamento</h2>
				<button
					type="button"
					style={{ fontSize: "inherit" }}
					onClick={isPlaying ? onPause : onPlay}
				>
					{isPlaying ? "■" : "▶"}
				</button>
			</div>
		</div>
	);
}
