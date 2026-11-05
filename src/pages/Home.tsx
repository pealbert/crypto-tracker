import { useEffect, useMemo, useState } from "react";

import { fetchCryptos, type Crypto } from "@/api/coinGecko";
import CryptoCard from "@/components/CryptoCard";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

type SortBy = "market_cap_rank" | "name" | "price" | "price_desc" | "change" | "market_cap";

export const Home = () => {
	const [cryptoList, setCryptoList] = useState<Crypto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [sortBy, setSortBy] = useState<SortBy>("market_cap_rank");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		let cancelled = false;

		const fetchCryptoData = async () => {
			try {
				const data = await fetchCryptos();

				if (!cancelled) {
					setCryptoList(data);
				}
			} catch (err) {
				if (!cancelled) {
					console.error("Error fetching crypto:", err);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		};

		void fetchCryptoData();

		return () => {
			cancelled = true;
		};
	}, []);

	const filteredList = useMemo(() => {
		const filtered = cryptoList.filter(
			(crypto) =>
				crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
		);

		filtered.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.name.localeCompare(b.name);

				case "price":
					return a.current_price - b.current_price;

				case "price_desc":
					return b.current_price - a.current_price;

				case "change": {
					const aChange = a.price_change_percentage_24h;
					const bChange = b.price_change_percentage_24h;

					if (aChange === null) return bChange === null ? 0 : 1;
					if (bChange === null) return -1;

					return aChange - bChange;
				}

				case "market_cap":
					return b.market_cap - a.market_cap;

				default: {
					const aRank = a.market_cap_rank;
					const bRank = b.market_cap_rank;

					if (aRank === null) return bRank === null ? 0 : 1;
					if (bRank === null) return -1;

					return aRank - bRank;
				}
			}
		});

		return filtered;
	}, [cryptoList, sortBy, searchQuery]);

	return (
		<div className="app">
			<header className="header">
				<div className="header-content">
					<div className="logo-section">
						<h1>🚀 Crypto Tracker</h1>
						<p>Real-time cryptocurrency prices and market data</p>
					</div>
					<div className="search-section">
						<input
							type="text"
							placeholder="Search cryptos..."
							className="search-input"
							onChange={(e) => setSearchQuery(e.target.value)}
							value={searchQuery}
						/>
					</div>
				</div>
			</header>
			<div className="controls">
				<div className="filter-group">
					<label htmlFor="sort-by">Sort by:</label>
					<select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
						<option value="market_cap_rank">Rank</option>
						<option value="name">Name</option>
						<option value="price">Price (Low to High)</option>
						<option value="change">24h Change</option>
						<option value="price_desc">Price (High to Low)</option>
						<option value="market_cap">Market Cap</option>
					</select>
				</div>

				<div className="view-toggle">
					<button
						type="button"
						className={viewMode === "grid" ? "active" : ""}
						onClick={() => setViewMode("grid")}
					>
						Grid
					</button>

					<button
						type="button"
						className={viewMode === "list" ? "active" : ""}
						onClick={() => setViewMode("list")}
					>
						List
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="loading">
					<div className="spinner" />
					<p>Loading crypto data...</p>
				</div>
			) : (
				<div className={cn("crypto-container", viewMode)}>
					{filteredList.map((crypto) => (
						<CryptoCard key={crypto.id} crypto={crypto} />
					))}
				</div>
			)}
		</div>
	);
};
