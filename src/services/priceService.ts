interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  total_volume: number;
  circulating_supply: number;
  max_supply: number;
  last_updated: string;
}

interface PriceData {
  price: number;
  marketCap: number;
  rank: number;
  change24h: number;
  change7d: number;
  volume: number;
  supply: number;
  maxSupply: number;
  lastUpdated: string;
  ath?: number;
  athDate?: string;
  atl?: number;
  atlDate?: string;
  athChangePercentage?: number;
  atlChangePercentage?: number;
}

interface HistoricalData {
  prices: number[][];
  market_caps: number[][];
  total_volumes: number[][];
}

interface MarketAnalysis {
  trend: "bullish" | "bearish" | "sideways";
  volatility: "low" | "medium" | "high";
  momentum: "strong_up" | "weak_up" | "neutral" | "weak_down" | "strong_down";
  support: number;
  resistance: number;
  summary: string;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const cryptoIds: { [key: string]: string } = {
  monad: "monad", // Monad - will add proper CoinGecko ID when available
  mon: "monad",
  bitcoin: "bitcoin",
  btc: "bitcoin",
  ethereum: "ethereum",
  eth: "ethereum",
  usdc: "usd-coin",
  usdt: "tether",
  bnb: "binancecoin",
  cardano: "cardano",
  ada: "cardano",
  solana: "solana",
  sol: "solana",
  polygon: "matic-network",
  matic: "matic-network",
  avalanche: "avalanche-2",
  avax: "avalanche-2",
  aptos: "aptos",
  apt: "aptos",
};

const formatPrice = (price: number): string => {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 100) return `$${price.toFixed(2)}`;
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
};

const formatVolume = (volume: number): string => {
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
  return `$${volume.toLocaleString()}`;
};

const analyzeMarket = (priceData: PriceData): MarketAnalysis => {
  const { price, change24h, volume, ath, atl } = priceData;

  // Trend analysis
  let trend: "bullish" | "bearish" | "sideways" = "sideways";
  if (change24h > 5) trend = "bullish";
  else if (change24h < -5) trend = "bearish";

  // Volatility analysis
  let volatility: "low" | "medium" | "high" = "medium";
  if (Math.abs(change24h) < 2) volatility = "low";
  else if (Math.abs(change24h) > 10) volatility = "high";

  // Momentum analysis
  let momentum:
    | "strong_up"
    | "weak_up"
    | "neutral"
    | "weak_down"
    | "strong_down" = "neutral";
  if (change24h > 10) momentum = "strong_up";
  else if (change24h > 2) momentum = "weak_up";
  else if (change24h < -10) momentum = "strong_down";
  else if (change24h < -2) momentum = "weak_down";

  // Support and resistance (simplified)
  const support = ath ? price * 0.8 : price * 0.9;
  const resistance = atl ? price * 1.2 : price * 1.1;

  // Generate summary
  let summary = `Market is showing ${trend} sentiment with ${volatility} volatility. `;
  if (ath && price) {
    const distanceFromATH = ((ath - price) / ath) * 100;
    summary += `Currently ${distanceFromATH.toFixed(1)}% below all-time high. `;
  }

  if (volume < 50000000) {
    summary += `Low volume suggests consolidation phase.`;
  } else {
    summary += `High volume indicates strong market interest.`;
  }

  return { trend, volatility, momentum, support, resistance, summary };
};

export const fetchCryptoPrice = async (
  cryptoName: string
): Promise<PriceData | null> => {
  try {
    const cleanName = cryptoName.toLowerCase().trim();
    const cryptoId = cryptoIds[cleanName] || cleanName;

    console.log(
      `Fetching comprehensive data for: ${cryptoName} (ID: ${cryptoId})`
    );

    // Special handling for Monad since it's not on CoinGecko yet (testnet)
    if (cryptoId === "monad" || cleanName === "monad" || cleanName === "mon") {
      console.log("Monad detected - returning testnet info");
      return {
        price: 0, // No public price yet - testnet
        marketCap: 0,
        rank: 0,
        change24h: 0,
        change7d: 0,
        volume: 0,
        supply: 0,
        maxSupply: 10000000000, // 10B estimated
        lastUpdated: new Date().toISOString(),
        ath: 0,
        athDate: "",
        atl: 0,
        atlDate: "",
        athChangePercentage: 0,
        atlChangePercentage: 0,
      };
    }

    const response = await fetch(
      `${COINGECKO_API}/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );

    if (!response.ok) {
      console.error(`API request failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      price: data.market_data?.current_price?.usd || 0,
      marketCap: data.market_data?.market_cap?.usd || 0,
      rank: data.market_cap_rank || 0,
      change24h: data.market_data?.price_change_percentage_24h || 0,
      change7d: data.market_data?.price_change_percentage_7d || 0,
      volume: data.market_data?.total_volume?.usd || 0,
      supply: data.market_data?.circulating_supply || 0,
      maxSupply: data.market_data?.max_supply || 0,
      lastUpdated: data.market_data?.last_updated || new Date().toISOString(),
      ath: data.market_data?.ath?.usd || 0,
      athDate: data.market_data?.ath_date?.usd || "",
      atl: data.market_data?.atl?.usd || 0,
      atlDate: data.market_data?.atl_date?.usd || "",
      athChangePercentage: data.market_data?.ath_change_percentage?.usd || 0,
      atlChangePercentage: data.market_data?.atl_change_percentage?.usd || 0,
    };
  } catch (error) {
    console.error("Error fetching crypto price:", error);
    return null;
  }
};

export const fetchHistoricalData = async (
  cryptoName: string,
  days: number = 30
): Promise<HistoricalData | null> => {
  try {
    const cleanName = cryptoName.toLowerCase().trim();
    const cryptoId = cryptoIds[cleanName] || cleanName;

    const response = await fetch(
      `${COINGECKO_API}/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );

    if (!response.ok) {
      console.error(`Historical data request failed: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return null;
  }
};

export const fetchMultipleCryptoPrices = async (
  cryptoNames: string[]
): Promise<{ [key: string]: PriceData }> => {
  try {
    const ids = cryptoNames
      .map((name) => {
        const cleanName = name.toLowerCase().trim();
        return cryptoIds[cleanName] || cleanName;
      })
      .join(",");

    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h,7d`
    );

    if (!response.ok) {
      console.error(`Multiple prices API request failed: ${response.status}`);
      return {};
    }

    const data: CryptoPrice[] = await response.json();
    const result: { [key: string]: PriceData } = {};

    data.forEach((coin) => {
      result[coin.id] = {
        price: coin.current_price,
        marketCap: coin.market_cap,
        rank: coin.market_cap_rank,
        change24h: coin.price_change_percentage_24h,
        change7d: coin.price_change_percentage_7d || 0,
        volume: coin.total_volume,
        supply: coin.circulating_supply,
        maxSupply: coin.max_supply || 0,
        lastUpdated: coin.last_updated,
      };
    });

    return result;
  } catch (error) {
    console.error("Error fetching multiple crypto prices:", error);
    return {};
  }
};

export const formatPriceResponse = (
  priceData: PriceData,
  cryptoName: string
): string => {
  const price = formatPrice(priceData.price);
  const marketCap = formatMarketCap(priceData.marketCap);
  const volume = formatVolume(priceData.volume);
  const change24h = priceData.change24h;
  const changeColor = change24h >= 0 ? "📈" : "📉";
  const changeSign = change24h >= 0 ? "+" : "";

  let response = `💰 **${cryptoName.toUpperCase()} Live Analysis**

🏷️ **Current Price:** ${price}
📊 **Market Cap:** ${marketCap} (Rank #${priceData.rank})
📈 **24h Change:** ${changeColor} ${changeSign}${change24h.toFixed(2)}%
💧 **Volume:** ${volume}
🪙 **Supply:** ${(priceData.supply / 1e9).toFixed(2)}B tokens`;

  if (priceData.maxSupply) {
    response += `\n⚡ **Max Supply:** ${(priceData.maxSupply / 1e9).toFixed(
      1
    )}B`;
  }

  if (priceData.ath) {
    const athFormatted = formatPrice(priceData.ath);
    const athDate = new Date(priceData.athDate || "").toLocaleDateString();
    response += `\n\n🎯 **All-Time High:** ${athFormatted} (${athDate})`;
    response += `\n📉 **From ATH:** ${priceData.athChangePercentage?.toFixed(
      1
    )}%`;
  }

  if (priceData.atl) {
    const atlFormatted = formatPrice(priceData.atl);
    const atlDate = new Date(priceData.atlDate || "").toLocaleDateString();
    response += `\n🔻 **All-Time Low:** ${atlFormatted} (${atlDate})`;
    response += `\n📈 **From ATL:** ${priceData.atlChangePercentage?.toFixed(
      1
    )}%`;
  }

  // Add market analysis
  const analysis = analyzeMarket(priceData);
  response += `\n\n🧠 **AI Analysis:**\n${analysis.summary}`;

  response += `\n\n*Live data updated: ${new Date(
    priceData.lastUpdated
  ).toLocaleString()}*`;

  return response;
};

export const getAdvancedAnalysis = async (
  cryptoName: string
): Promise<string> => {
  try {
    const [priceData] = await Promise.all([
      fetchCryptoPrice(cryptoName),
      fetchHistoricalData(cryptoName, 30),
    ]);

    if (!priceData) {
      return `Unable to fetch data for ${cryptoName}. Please check the spelling or try another cryptocurrency.`;
    }

    const analysis = analyzeMarket(priceData);

    return `🔍 **Advanced ${cryptoName.toUpperCase()} Analysis**

📊 **Technical Indicators:**
• Trend: ${analysis.trend.toUpperCase()} ${
      analysis.trend === "bullish"
        ? "🟢"
        : analysis.trend === "bearish"
        ? "🔴"
        : "🟡"
    }
• Volatility: ${analysis.volatility.toUpperCase()} ${
      analysis.volatility === "high" ? "⚠️" : "✅"
    }
• Momentum: ${analysis.momentum.replace("_", " ").toUpperCase()}

💹 **Price Levels:**
• Support: ${formatPrice(analysis.support)}
• Resistance: ${formatPrice(analysis.resistance)}
• Current: ${formatPrice(priceData.price)}

${analysis.summary}

*Analysis generated: ${new Date().toLocaleString()}*`;
  } catch (error) {
    console.error("Error generating advanced analysis:", error);
    return `Unable to generate advanced analysis for ${cryptoName} at this time.`;
  }
};

export const getMarketSummary = async (): Promise<string> => {
  try {
    const topCryptos = await fetchMultipleCryptoPrices([
      "bitcoin",
      "ethereum",
      "aptos",
      "cardano",
      "solana",
    ]);

    if (Object.keys(topCryptos).length === 0) {
      return "Unable to fetch current market data. Please try again later.";
    }

    let summary = "📊 **Live Crypto Market Dashboard**\n\n";

    const cryptoNames: { [key: string]: string } = {
      aptos: "Aptos (APT)",
      bitcoin: "Bitcoin (BTC)",
      ethereum: "Ethereum (ETH)",
      cardano: "Cardano (ADA)",
      solana: "Solana (SOL)",
    };

    Object.entries(topCryptos).forEach(([id, data]) => {
      const name = cryptoNames[id] || id;
      const changeIcon = data.change24h >= 0 ? "📈" : "📉";
      const changeColor = data.change24h >= 0 ? "🟢" : "🔴";

      summary += `${changeColor} **${name}**\n`;
      summary += `   Price: ${formatPrice(data.price)} ${changeIcon} ${
        data.change24h >= 0 ? "+" : ""
      }${data.change24h.toFixed(2)}%\n`;
      summary += `   MCap: ${formatMarketCap(
        data.marketCap
      )} | Vol: ${formatVolume(data.volume)}\n\n`;
    });

    // Add market sentiment
    const avgChange =
      Object.values(topCryptos).reduce(
        (sum, crypto) => sum + crypto.change24h,
        0
      ) / Object.keys(topCryptos).length;
    const sentiment =
      avgChange > 2
        ? "🟢 BULLISH"
        : avgChange < -2
        ? "🔴 BEARISH"
        : "🟡 NEUTRAL";

    summary += `🧠 **Market Sentiment:** ${sentiment} (Avg: ${
      avgChange >= 0 ? "+" : ""
    }${avgChange.toFixed(2)}%)`;

    return summary;
  } catch (error) {
    console.error("Error getting market summary:", error);
    return "Unable to fetch market summary at this time.";
  }
};
