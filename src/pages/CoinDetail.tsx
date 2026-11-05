import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { fetchCoinData, type CoinDetails } from "@/api/coinGecko";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/formatter";

type ErrorType = "not-found" | "fetch-error";

export const CoinDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [coin, setCoin] = useState<CoinDetails | null>(null);
	const [loadedId, setLoadedId] = useState<string | null>(null);
	const [error, setError] = useState<ErrorType | null>(null);

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

	const priceChange = coin?.market_data.price_change_percentage_24h || 0;
	const isPositive = priceChange >= 0;

	return (
		<div className="app">
			<header className="header">
				<div className="header-content">
					<div className="logo-section">
						<h1>🚀 Crypto Tracker</h1>
						<p>Real-time cryptocurrency prices and market data</p>
					</div>

					<button type="button" onClick={() => navigate("/")} className="back-button">
						← Back to List
					</button>
				</div>
			</header>

			<div className="coin-detail">
				<div className="coin-header">
					<div className="coin-title">
						<img src={coin?.image.large} alt={coin?.name} />
						<div>
							<h1>{coin?.name}</h1>
							<p className="symbol">{coin?.symbol.toUpperCase()}</p>
						</div>
					</div>

					<span className="rank">Rank #{coin?.market_cap_rank}</span>
				</div>

				<div className="coin-price-section">
					<div className="current-price">
						<h2 className="price">{formatPrice(coin?.market_data.current_price.usd ?? 0)}</h2>
						<span className={cn("change-badge", isPositive ? "positive" : "negative")}>
							{isPositive ? "↑" : "↓"} {Math.abs(priceChange).toFixed(2)}%
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
