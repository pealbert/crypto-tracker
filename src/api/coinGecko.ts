const BASE_URL = "https://api.coingecko.com/api/v3";

export interface Crypto {
	id: string;
	symbol: string;
	name: string;
	image: string;
	current_price: number;
	market_cap: number;
	market_cap_rank: number | null;
	fully_diluted_valuation: number | null;
	total_volume: number;
	high_24h: number | null;
	low_24h: number | null;
	price_change_24h: number | null;
	price_change_percentage_24h: number | null;
	market_cap_change_24h: number;
	market_cap_change_percentage_24h: number;
	circulating_supply: number;
	total_supply: number | null;
	max_supply: number | null;
	ath: number;
	ath_change_percentage: number;
	ath_date: string;
	atl: number;
	atl_change_percentage: number;
	atl_date: string;
	last_updated: string;
}

export const fetchCryptos = async (): Promise<Crypto[]> => {
	const response = await fetch(
		`${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch cryptos: ${response.status}`);
	}

	return (await response.json()) as Crypto[];
};
