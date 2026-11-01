import { useEffect, useState } from "react";

import { fetchCryptos, type Crypto } from "@/api/coinGecko";
import CryptoCard from "@/components/CryptoCard";

export const Home = () => {
	const [cryptoList, setCryptoList] = useState<Crypto[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchCryptoData = async () => {
			try {
				const data = await fetchCryptos();
				setCryptoList(data);
			} catch (err) {
				console.error("Error fetching crypto:", err);
			} finally {
				setIsLoading(false);
			}
		};

		void fetchCryptoData();
	}, []);

	return (
		<div className="app">
			{isLoading ? (
				<div className="loading">
					<div className="spinner" />
					<p>Loading crypto data..</p>
				</div>
			) : (
				<div className="crypto-container">
					{cryptoList.map((crypto) => (
						<CryptoCard key={crypto.id} crypto={crypto} />
					))}
				</div>
			)}
		</div>
	);
};
