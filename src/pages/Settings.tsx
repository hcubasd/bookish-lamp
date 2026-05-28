import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { divFinder } from "../helpers/divFinder";
import { applyColors, getLightness } from "../helpers/applyColors";
import { applyText } from "../helpers/applyText";
import { setupPaletteControls } from "../helpers/paletteControls";

export default function Settings() {
	const navigate = useNavigate();
	const rootRef = useRef<HTMLDivElement>(null);
	const variationSliderRef = useRef<HTMLInputElement>(null);
	const colorRowRef = useRef<HTMLDivElement>(null);
	const luminositySliderRef = useRef<HTMLInputElement>(null);
	const automationSliderRef = useRef<HTMLInputElement>(null);
	const automationLabelRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!rootRef.current) return;
		const found = divFinder(rootRef.current);
		applyColors(found);
		applyText(found);

		const cleanups: Array<() => void> = [];

		let paletteReapply: (() => void) | undefined;
		if (variationSliderRef.current && colorRowRef.current) {
			const colorDivs = Array.from(
				colorRowRef.current.children,
			) as HTMLDivElement[];
			const { cleanup, reapply } = setupPaletteControls(
				variationSliderRef.current,
				colorDivs,
			);
			paletteReapply = reapply;
			cleanups.push(cleanup);
		}

		if (luminositySliderRef.current) {
			const slider = luminositySliderRef.current;
			slider.min = "1";
			slider.max = "99";
			slider.step = "1";
			slider.value = String(getLightness());
			const onLuminosity = () => {
				localStorage.setItem("lightness", slider.value);
				applyColors(found);
				paletteReapply?.();
			};
			slider.addEventListener("input", onLuminosity);
			cleanups.push(() => slider.removeEventListener("input", onLuminosity));
		}

		if (automationSliderRef.current) {
			const slider = automationSliderRef.current;
			slider.min = "0";
			slider.max = "600";
			slider.step = "1";
			const stored = parseInt(localStorage.getItem("automation") ?? "0", 10);
			const initial = Number.isFinite(stored) && stored >= 0 ? stored : 0;
			slider.value = String(initial);
			if (automationLabelRef.current)
				automationLabelRef.current.textContent = `${initial}s`;
			const onAutomation = () => {
				const val = parseInt(slider.value, 10);
				localStorage.setItem("automation", String(val));
				if (automationLabelRef.current)
					automationLabelRef.current.textContent = `${val}s`;
			};
			slider.addEventListener("input", onAutomation);
			cleanups.push(() => slider.removeEventListener("input", onAutomation));
		}

		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onTheme = () => applyColors(found);
		mq.addEventListener("change", onTheme);
		const onResize = () => applyText(found);
		window.addEventListener("resize", onResize);
		return () => {
			mq.removeEventListener("change", onTheme);
			window.removeEventListener("resize", onResize);
			cleanups.forEach((c) => {
				c();
			});
		};
	}, []);

	return (
		<div
			ref={rootRef}
			className="panel"
			style={{ flexDirection: "column", height: "100%" }}
		>
			<div className="label">
				<span>
					<button
						onClick={() => navigate("/sales")}
						type="button"
						style={{
							display: "inline",
							background: "none",
							border: "none",
							padding: 0,
							font: "inherit",
							color: "inherit",
							cursor: "pointer",
						}}
					>
						{"<"}
					</button>{" "}
					<span>Configurações</span>{" "}
					<button
						onClick={() => navigate("/sales")}
						type="button"
						style={{
							display: "inline",
							background: "none",
							border: "none",
							padding: 0,
							font: "inherit",
							color: "inherit",
							cursor: "pointer",
						}}
					>
						{">"}
					</button>
				</span>
			</div>
			<div className="panel oriented" style={{ flex: 1 }}>
				<div className="panel" style={{ flex: 1, flexDirection: "column" }}>
					<div className="label">
						<span>Cores</span>
					</div>
					<div className="panel" style={{ flex: 1 }}>
						<div
							className="panel"
							style={{ flex: 1, alignSelf: "stretch", flexDirection: "column" }}
						>
							<div className="label">
								<span>Variação</span>
							</div>
							<div
								className="panel"
								style={{ flex: 1, flexDirection: "column" }}
							>
								<div
									ref={colorRowRef}
									className="front-panel"
									style={{ flex: 1 }}
								>
									<div style={{ flex: 1, alignSelf: "stretch" }} />
									<div style={{ flex: 1, alignSelf: "stretch" }} />
									<div style={{ flex: 1, alignSelf: "stretch" }} />
								</div>
								<div className="front-panel">
									<input
										ref={variationSliderRef}
										type="range"
										style={{ width: "100%" }}
									/>
								</div>
							</div>
						</div>
						<div
							className="panel"
							style={{ flex: 1, alignSelf: "stretch", flexDirection: "column" }}
						>
							<div className="label">
								<span>Luminosidade</span>
							</div>
							<div
								className="panel"
								style={{ flex: 1, flexDirection: "column" }}
							>
								<div className="front-panel" style={{ flex: 1 }}>
									<div
										className="swatch-fg"
										style={{ flex: 1, alignSelf: "stretch" }}
									/>
									<div
										className="swatch-bg"
										style={{ flex: 1, alignSelf: "stretch" }}
									/>
								</div>
								<div className="front-panel">
									<input
										ref={luminositySliderRef}
										type="range"
										style={{ width: "100%" }}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="panel" style={{ flex: 1, flexDirection: "column" }}>
					<div className="label">
						<span>Automação</span>
					</div>
					<div className="panel" style={{ flex: 1 }}>
						<div
							className="panel"
							style={{ flex: 1, alignSelf: "stretch", flexDirection: "column" }}
						>
							<div className="label" style={{ flex: 1 }}>
								<span ref={automationLabelRef}>0s</span>
							</div>
							<div className="front-panel">
								<input
									ref={automationSliderRef}
									type="range"
									style={{ width: "100%" }}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
