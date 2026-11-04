import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { fetchCoinData, type CoinDetails } from "@/api/coinGecko";

export const CoinDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [coin, setCoin] = useState<CoinDetails | null>(null);
	const [loadedId, setLoadedId] = useState<string | null>(null);
	const [error, setError] = useState<"not-found" | "fetch-error" | null>(null);

	useEffect(() => {
		if (!id) return;

		let cancelled = false;

		const loadCoinData = async () => {
			try {
				const data = await fetchCoinData(id);

				if (!cancelled) {
					setCoin(data);
					setError(null);
				}
			} catch (err) {
				if (!cancelled) {
					setCoin(null);

					if (err instanceof Error && err.message.includes("404")) {
						setError("not-found");
					} else {
						setError("fetch-error");
					}

					console.error("Error fetching crypto:", err);
				}
			} finally {
				if (!cancelled) {
					setLoadedId(id);
				}
			}
		};

		void loadCoinData();

		return () => {
			cancelled = true;
		};
	}, [id]);

	const isLoading = Boolean(id && loadedId !== id);

	if (isLoading) {
		return (
			<div className="app">
				<div className="loading">
					<div className="spinner" />
					<p>Loading cryptocurrency...</p>
				</div>
			</div>
		);
	}

	if (!id || error === "not-found" || (!coin && !error)) {
		return (
			<div className="app">
				<div className="no-results">
					<p>Coin Not Found</p>
					<button type="button" onClick={() => navigate("/")}>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	if (error === "fetch-error") {
		return (
			<div className="app">
				<div className="no-results">
					<p>Failed to load cryptocurrency data.</p>
					<button type="button" onClick={() => navigate("/")}>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	return <div>{coin?.id}</div>;
};
