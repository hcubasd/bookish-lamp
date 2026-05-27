import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";

function updateGap() {
	const gap = Math.log(screen.width * screen.height);
	document.documentElement.style.setProperty("--gap", `${gap}px`);
}

export default function App() {
	useEffect(() => {
		updateGap();
		window.addEventListener("resize", updateGap);
		return () => window.removeEventListener("resize", updateGap);
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Sales />} />
				<Route path="/settings" element={<Settings />} />
			</Routes>
		</BrowserRouter>
	);
}
