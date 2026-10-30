import { BrowserRouter, Route, Routes } from "react-router";

import { CoinDetail } from "@/pages/CoinDetail";
import { Home } from "@/pages/Home";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/coin/:id" element={<CoinDetail />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
