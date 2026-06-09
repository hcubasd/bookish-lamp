import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sales from "./components/Sales";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Sales />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
