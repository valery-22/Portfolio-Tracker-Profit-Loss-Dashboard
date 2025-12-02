// CoinGecko API integration with rate limiting and error handling

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

interface CoinGeckoPrice {
  [coinId: string]: {
    usd: number
    usd_24h_change: number
  }
}

interface CoinGeckoSearchResult {
  id: string
  symbol: string
  name: string
  thumb: string
}

interface CoinGeckoSearchResponse {
  coins: CoinGeckoSearchResult[]
}

// Simple in-memory cache to reduce API calls
const priceCache = new Map<string, { data: CoinGeckoPrice; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

/**
 * Fetches current prices for multiple coins from CoinGecko
 * Implements caching to respect rate limits
 */
export async function fetchPrices(coinIds: string[]): Promise<CoinGeckoPrice> {
  if (coinIds.length === 0) return {}

  const cacheKey = coinIds.sort().join(",")
  const cached = priceCache.get(cacheKey)

  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinIds.join(",")}&vs_currencies=usd&include_24hr_change=true`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("API rate limit exceeded. Please wait a moment and try again.")
    }
    throw new Error(`Failed to fetch prices: ${response.statusText}`)
  }

  const data: CoinGeckoPrice = await response.json()

  // Cache the response
  priceCache.set(cacheKey, { data, timestamp: Date.now() })

  return data
}

/**
 * Searches for coins by name or symbol
 */
export async function searchCoins(query: string): Promise<CoinGeckoSearchResult[]> {
  if (!query || query.length < 2) return []

  const url = `${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("API rate limit exceeded. Please wait a moment.")
    }
    throw new Error(`Search failed: ${response.statusText}`)
  }

  const data: CoinGeckoSearchResponse = await response.json()
  return data.coins.slice(0, 10) // Return top 10 results
}

/**
 * Fetches detailed coin data including sparkline
 */
export async function fetchCoinDetails(coinId: string) {
  const url = `${COINGECKO_BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch coin details: ${response.statusText}`)
  }

  return response.json()
}

// Popular coins for quick add
export const POPULAR_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "polygon", symbol: "MATIC", name: "Polygon" },
]
