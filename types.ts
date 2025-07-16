export interface Commodity {
  ticker: string;
  name: string;
}

export interface TimeRangeOption {
  label: string;
  value: string;
}

export interface ChartDataPoint {
  time: number;
  price: number;
  volume?: number;
}

export interface NormalizedChartDataPoint {
  time: number;
  [key: string]: number | null | undefined; // Ticker is the key, normalized price is the value. Allow null/undefined for indicators.
  SMA5?: number | null;
  SMA20?: number | null;
  RSI14?: number | null;
  BB_UPPER?: number | null;
  BB_MIDDLE?: number | null;
  BB_LOWER?: number | null;
  MACD_LINE?: number | null;
  MACD_SIGNAL?: number | null;
  MACD_HISTOGRAM?: number | null;
  volume?: number | null;
}

export interface KeyMetricsData {
  regularMarketPrice: number;
  previousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  currency: string;
  symbol: string;
  regularMarketVolume?: number;
}

export interface YahooFinanceResponse {
  chart: {
    result: {
      meta: KeyMetricsData;
      timestamp: number[];
      indicators: {
        quote: {
          close: (number | null)[];
          volume?: (number | null)[];
        }[];
      };
    }[];
    error: any;
  };
}

export interface DashboardCommodityData {
  ticker: string;
  name: string;
  keyMetrics: KeyMetricsData;
  chartData: ChartDataPoint[];
  tradingValue: number;
}