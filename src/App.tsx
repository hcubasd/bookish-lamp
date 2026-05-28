import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";

function updateGap() {
	const gap = Math.round(Math.log(screen.width * screen.height) / 2);
	document.documentElement.style.setProperty("--gap", `${gap}px`);
}

updateGap();

export default function App() {
	useEffect(() => {
		window.addEventListener("resize", updateGap);
		return () => window.removeEventListener("resize", updateGap);
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/sales" replace />} />
				<Route path="/sales" element={<Sales />} />
				<Route path="/settings" element={<Settings />} />
			</Routes>
		</BrowserRouter>
	);
}
