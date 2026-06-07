import { matchColors } from "miniature-waffle";
import { colorBg, squeezeFg } from "psychic-potato";
import { useEffect } from "react";
import Label from "./Label";

export default function Sales() {
	useEffect(() => {
		const salesRoot = document.getElementById("sales-root");
		if (salesRoot instanceof HTMLDivElement) {
			colorBg(salesRoot, { startL: 75, endL: 100 });
		} else {
			throw new Error("No sales root div element found");
		}

		function onResize() {
			if (salesRoot instanceof HTMLDivElement) {
				const fontSize = squeezeFg(salesRoot);
				salesRoot.style.setProperty("--font-size", `${fontSize}px`);
			} else {
				throw new Error("No sales root div element found");
			}
		}

		onResize();

		window.addEventListener("resize", onResize);

		const color = matchColors(1, 75)[Math.floor(Math.random() * 256)][0];
		const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;

		const pipelineHistory = document.getElementById("pipeline-history");
		if (!pipelineHistory) throw new Error("No pipeline history element found");
		pipelineHistory.style.color = colorString;

		const pipelineLegend = document.getElementById("pipeline-legend");
		if (!pipelineLegend) throw new Error("No pipeline legend element found");
		pipelineLegend.style.color = colorString;

		const pipelineBars = document.getElementsByClassName("pipeline-bar");
		if (!pipelineBars) throw new Error("No pipeline bar found");
		for (const pipelineBar of pipelineBars) {
			if (pipelineBar instanceof HTMLElement) {
				pipelineBar.style.backgroundColor = colorString;
			}
		}

		const pipelineHeader = document.getElementById("pipeline-header");
		if (!pipelineHeader) throw new Error("No pipeline header element found");
		pipelineHeader.style.color = colorString;
	}, []);
	return (
		<div
			id="sales-root"
			className="bg"
			style={{ flexDirection: "column", height: "100%" }}
		>
			<Label style={{ width: "100%" }}>
				<h1>Vendas</h1>
			</Label>
			<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
				<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
					<Label style={{ width: "100%" }}>
						<h2>Histórico</h2>
					</Label>
					<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
						<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
							<Label>
								<span id="pipeline-legend">Pipeline</span>
							</Label>
							<div className="bg" style={{ flex: 1 }}>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
								<div
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<Label>0</Label>
									<div
										style={{
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div className="pipeline-bar" style={{ flex: 1 }} />
									</div>
								</div>
							</div>
						</div>
						<div className="bg">
							<Label style={{ flex: 1 }}>January</Label>
							<Label style={{ flex: 1 }}>February</Label>
							<Label style={{ flex: 1 }}>March</Label>
							<Label style={{ flex: 1 }}>April</Label>
							<Label style={{ flex: 1 }}>May</Label>
							<Label style={{ flex: 1 }}>June</Label>
							<Label style={{ flex: 1 }}>July</Label>
							<Label style={{ flex: 1 }}>August</Label>
							<Label style={{ flex: 1 }}>September</Label>
							<Label style={{ flex: 1 }}>October</Label>
							<Label style={{ flex: 1 }}>November</Label>
							<Label style={{ flex: 1 }}>December</Label>
						</div>
						<div className="bg" style={{ flexDirection: "column" }}>
							<div id="pipeline-history" className="bg">
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
								<Label style={{ flex: 1 }}>0</Label>
							</div>
						</div>
					</div>
				</div>
				<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
					<Label style={{ width: "100%" }}>
						<h2>{"Em andamento"}</h2>
					</Label>
					<div className="bg" style={{ flex: 1 }}>
						<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
							<Label id="pipeline-header">
								<h3>Pipeline</h3>
							</Label>
							<div className="bg" style={{ flex: 1, flexDirection: "column" }}>
								<div className="bg">
									<Label style={{ flex: 1 }}>Stage</Label>
									<Label style={{ flex: 1 }}>0</Label>
								</div>
								<div
									className="bg"
									style={{
										flex: 1,
										flexDirection: "column",
										overflowY: "auto",
										minHeight: 0,
									}}
								>
									<div className="bg">
										<div className="bg" style={{ flex: 1 }}>
											<div
												className="cell "
												style={{
													flex: 1,
													overflowX: "auto",
													minWidth: 0,
												}}
											>
												Awareness
											</div>
										</div>
										<Label style={{ flex: 1 }}>0</Label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
