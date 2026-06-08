import { colorBg, squeezeFg } from "psychic-potato";
import { useEffect } from "react";
import Label from "./Label";
import synchronizeSales from "../helpers/salesSynchronizer";

export default function Sales() {
	useEffect(() => {
		const salesRoot = document.getElementById("sales-root");

		if (salesRoot instanceof HTMLDivElement) {
			colorBg(salesRoot, { startL: 75, endL: 100 });
		} else {
			throw new Error('Sales root is not an instace of HTML div')
		}

		function onResize() {
			if (salesRoot instanceof HTMLDivElement) {
				const fontSize = squeezeFg(salesRoot);
				salesRoot.style.setProperty("--font-size", `${fontSize}px`);
				const h2 = salesRoot.querySelector('h2');
				if (!h2) throw new Error('No h2 element found in sales root')
				const h2Margin = getComputedStyle(h2).marginBlockStart;
				if (!h2Margin) throw new Error('No h2 margin found');
				salesRoot.style.setProperty('--h2-margin', h2Margin);
			} else {
				throw new Error('Sales root is not an instace of HTML div')
			}
		}

		onResize();
		window.addEventListener("resize", onResize);

		synchronizeSales();
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
					<div className='bg' style={{ justifyContent: 'center', alignItems: 'center' }}>
						<div className='fg' style={{ display: 'flex', gap: 'var(--h2-margin, 0)' }}>
							<button style={{ fontSize: 'inherit' }}>Anterior</button>
							<h2>Em andamento</h2>
							<button style={{ fontSize: 'inherit' }}>Próximo</button>
						</div>
					</div>
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
