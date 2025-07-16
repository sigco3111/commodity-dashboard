import { ChartDataPoint, KeyMetricsData, YahooFinanceResponse } from '../types';

const CORS_PROXY = 'https://corsproxy.io/?';

const getIntervalForRange = (range: string): string => {
  switch (range) {
    case '1d':
      return '5m';
    case '5d':
      return '30m';
    case '1mo':
      return '1d';
    case '6mo':
      return '1d';
    case '1y':
      return '1d';
    case '5y':
      return '1wk';
    default:
      return '1d';
  }
};

export const fetchCommodityData = async (ticker: string, range: string): Promise<{ chartData: ChartDataPoint[], keyMetrics: KeyMetricsData }> => {
  const interval = getIntervalForRange(range);
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${range}&interval=${interval}`;
  const url = `${CORS_PROXY}${encodeURIComponent(yahooUrl)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: YahooFinanceResponse = await response.json();

  if (data.chart.error) {
    throw new Error(`Yahoo Finance API error: ${data.chart.error.description}`);
  }

  if (!data.chart.result || data.chart.result.length === 0) {
    throw new Error(`Invalid data structure: No result found for ticker ${ticker}.`);
  }
  
  const result = data.chart.result[0];

  if (!result.meta) {
      throw new Error(`Invalid data structure: Key metrics (meta) are missing for ticker ${ticker}.`);
  }

  let keyMetrics: KeyMetricsData = result.meta;
  const quote = result.indicators?.quote?.[0];
  
  let chartData: ChartDataPoint[] = [];

  if (result.timestamp && quote?.close) {
    chartData = result.timestamp
      .map((ts, index) => ({
        time: ts * 1000,
        price: quote.close[index],
        volume: quote.volume ? quote.volume[index] : undefined,
      }))
      .filter(point => point.price !== null && typeof point.price === 'number' && !isNaN(point.price)) as ChartDataPoint[];
  }
  
  // Normalize prices from USX (cents) to USD
  if (keyMetrics.currency === 'USX') {
    keyMetrics = {
      ...keyMetrics,
      regularMarketPrice: keyMetrics.regularMarketPrice / 100,
      previousClose: keyMetrics.previousClose / 100,
      regularMarketOpen: keyMetrics.regularMarketOpen / 100,
      regularMarketDayHigh: keyMetrics.regularMarketDayHigh / 100,
      regularMarketDayLow: keyMetrics.regularMarketDayLow / 100,
      currency: 'USD',
    };

    chartData = chartData.map(point => ({ ...point, price: point.price / 100 }));
  }

  return { chartData, keyMetrics };
};