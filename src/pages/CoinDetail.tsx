import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import {
	fetchChartData,
	fetchCoinData,
	type CoinDetails,
	type FormattedChartData,
} from "@/api/coinGecko";
import { cn } from "@/lib/utils";
import { formatMarketCap, formatPrice } from "@/utils/formatter";

type ErrorType = "not-found" | "fetch-error";

export const CoinDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [coin, setCoin] = useState<CoinDetails | null>(null);
	const [chartData, setChartData] = useState<FormattedChartData[]>([]);
	const [loadedId, setLoadedId] = useState<string | null>(null);
	const [error, setError] = useState<ErrorType | null>(null);

	useEffect(() => {
		if (!id) return;

		let cancelled = false;

		const loadData = async () => {
			try {
				const [coinData, chartData] = await Promise.all([fetchCoinData(id), fetchChartData(id)]);

				const formattedChartData = chartData.prices.map(([timestamp, price]) => ({
					timestamp,
					price,
				}));

				if (!cancelled) {
					setCoin(coinData);
					setChartData(formattedChartData);
					setError(null);
				}
			} catch (err) {
				if (!cancelled) {
					setCoin(null);
					setChartData([]);

					if (err instanceof Error && err.message.includes("404")) {
						setError("not-found");
					} else {
						setError("fetch-error");
					}

					console.error("Error fetching cryptocurrency data:", err);
				}
			} finally {
				if (!cancelled) {
					setLoadedId(id);
				}
			}
		};

		void loadData();

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

					<div className="price-ranges">
						<div className="price-range">
							<span className="range-label">24h High</span>
							<span className="range-value">
								{formatPrice(coin?.market_data.high_24h.usd ?? 0)}
							</span>
						</div>
						<div className="price-range">
							<span className="range-label">24h Low</span>
							<span className="range-value">{formatPrice(coin?.market_data.low_24h.usd ?? 0)}</span>
						</div>
					</div>
				</div>

				<div className="chart-section">
					<h3>Price Chart (7 Days)</h3>
					<ResponsiveContainer width="100%" height={400}>
						<LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />

							<XAxis
								dataKey="timestamp"
								tickFormatter={(timestamp: number) =>
									new Date(timestamp).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									})
								}
								stroke="#9CA3AF"
								style={{ fontSize: "12px" }}
							/>
							<YAxis
								stroke="#9CA3AF"
								style={{ fontSize: "12px" }}
								tickFormatter={(price: number) => `$${price.toFixed(2)}`}
								domain={["auto", "auto"]}
							/>

							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(20, 20, 40, 0.95)",
									border: "1px solid rgba(255, 255, 255, 0.1",
									borderRadius: "8px",
									color: "#E0E0E0",
								}}
								labelFormatter={(timestamp) =>
									new Date(Number(timestamp)).toLocaleString("en-US", {
										month: "short",
										day: "numeric",
									})
								}
								formatter={(value) => formatPrice(Number(value))}
							/>

							<Line dataKey="price" type="monotone" stroke="#ADD8E6" strokeWidth={2} dot={false} />
						</LineChart>
					</ResponsiveContainer>
				</div>

				<div className="stats-grid">
					<div className="stat-card">
						<span className="stat-label">Market Cap</span>
						<span className="stat-value">
							${formatMarketCap(coin?.market_data.market_cap.usd || 0)}
						</span>
					</div>

					<div className="stat-card">
						<span className="stat-label">Volume (24h)</span>
						<span className="stat-value">
							${formatMarketCap(coin?.market_data.total_volume.usd || 0)}
						</span>
					</div>

					<div className="stat-card">
						<span className="stat-label">Circulating Supply</span>
						<span className="stat-value">
							{coin?.market_data.circulating_supply?.toLocaleString() || "N/A"}
						</span>
					</div>

					<div className="stat-card">
						<span className="stat-label">Total Supply</span>
						<span className="stat-value">
							{coin?.market_data.total_supply?.toLocaleString() || "N/A"}
						</span>
					</div>
				</div>
			</div>

			<footer className="footer">
				<p>Data provided by CoinGecko API · Rate Limited</p>
			</footer>
		</div>
	);
};
