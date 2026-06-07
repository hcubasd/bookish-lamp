export default function Label({
	id,
	children,
	style,
}: {
	id?: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return (
		<div id={id} className="bg" style={{ justifyContent: "center", ...style }}>
			<div className="fg" style={{ whiteSpace: "nowrap" }}>
				{children}
			</div>
		</div>
	);
}
