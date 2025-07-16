import { ChartDataPoint } from '../types';

/**
 * Calculates the Simple Moving Average (SMA) for a given period.
 * @param data - Array of chart data points { time, price }.
 * @param period - The number of data points to include in the average.
 * @returns An array of SMA values, with initial values as null.
 */
export const calculateSMA = (data: ChartDataPoint[], period: number): (number | null)[] => {
  if (period <= 0 || data.length < period) {
    return Array(data.length).fill(null);
  }

  const smaValues: (number | null)[] = Array(period - 1).fill(null);
  
  let sum = data.slice(0, period).reduce((acc, val) => acc + (val.price || 0), 0);
  smaValues.push(sum / period);

  for (let i = period; i < data.length; i++) {
    sum = sum - (data[i - period].price || 0) + (data[i].price || 0);
    smaValues.push(sum / period);
  }

  return smaValues;
};


/**
 * Calculates the Relative Strength Index (RSI).
 * @param data - Array of chart data points { time, price }.
 * @param period - The look-back period, typically 14.
 * @returns An array of RSI values, with initial values as null.
 */
export const calculateRSI = (data: ChartDataPoint[], period: number = 14): (number | null)[] => {
  if (data.length <= period) {
    return Array(data.length).fill(null);
  }

  const rsiValues: (number | null)[] = Array(period).fill(null);
  const changes = data.map((d, i) => i > 0 ? d.price - data[i-1].price : 0).slice(1);

  let initialGain = 0;
  let initialLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      initialGain += changes[i];
    } else {
      initialLoss -= changes[i];
    }
  }

  let avgGain = initialGain / period;
  let avgLoss = initialLoss / period;

  if (avgLoss === 0) {
      rsiValues.push(100);
  } else {
      const firstRSI = 100 - (100 / (1 + (avgGain / avgLoss)));
      rsiValues.push(firstRSI);
  }
  
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    if (avgLoss === 0) {
        rsiValues.push(100);
    } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsiValues.push(rsi);
    }
  }

  return rsiValues;
};

export const calculateEMA = (data: (ChartDataPoint | {price: number})[], period: number): (number | null)[] => {
  if (period <= 0 || data.length < period) {
    return Array(data.length).fill(null);
  }
  const emaValues: (number | null)[] = Array(period - 1).fill(null);
  const multiplier = 2 / (period + 1);
  
  // Calculate initial SMA
  let sum = data.slice(0, period).reduce((acc, val) => acc + (val.price || 0), 0);
  let previousEma = sum / period;
  emaValues.push(previousEma);
  
  for (let i = period; i < data.length; i++) {
    const price = data[i].price || 0;
    const ema = (price - previousEma) * multiplier + previousEma;
    emaValues.push(ema);
    previousEma = ema;
  }
  
  return emaValues;
};

export const calculateBollingerBands = (data: ChartDataPoint[], period: number = 20, stdDev: number = 2): { middle: (number | null)[], upper: (number | null)[], lower: (number | null)[] } => {
  if (data.length < period) {
    return {
      middle: Array(data.length).fill(null),
      upper: Array(data.length).fill(null),
      lower: Array(data.length).fill(null),
    };
  }
  
  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1 || middle[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = middle[i]!;
      const variance = slice.reduce((acc, val) => acc + Math.pow((val.price || 0) - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      upper.push(mean + stdDev * standardDeviation);
      lower.push(mean - stdDev * standardDeviation);
    }
  }

  return { middle, upper, lower };
};

export const calculateMACD = (data: ChartDataPoint[], shortPeriod: number = 12, longPeriod: number = 26, signalPeriod: number = 9): { macdLine: (number | null)[], signalLine: (number | null)[], histogram: (number | null)[] } => {
  if (data.length < longPeriod) {
     return {
        macdLine: Array(data.length).fill(null),
        signalLine: Array(data.length).fill(null),
        histogram: Array(data.length).fill(null)
     };
  }

  const emaShort = calculateEMA(data, shortPeriod);
  const emaLong = calculateEMA(data, longPeriod);
  
  const macdLine: (number | null)[] = [];
  for(let i=0; i < data.length; i++){
      if(emaShort[i] !== null && emaLong[i] !== null){
          macdLine.push(emaShort[i]! - emaLong[i]!);
      } else {
          macdLine.push(null);
      }
  }

  const macdPoints = macdLine.map((price) => ({ price: price! })).filter(p => p.price !== null);
  const signalLineFull: (number | null)[] = Array(data.length).fill(null);
  
  if (macdPoints.length >= signalPeriod) {
    const signalEma = calculateEMA(macdPoints, signalPeriod);
    let signalIndex = 0;
    for(let i=0; i < macdLine.length; i++){
      if(macdLine[i] !== null) {
        if (signalIndex < signalEma.length) {
          signalLineFull[i] = signalEma[signalIndex];
          signalIndex++;
        }
      }
    }
  }
  
  const histogram: (number | null)[] = [];
  for(let i=0; i < data.length; i++){
      if(macdLine[i] !== null && signalLineFull[i] !== null){
          histogram.push(macdLine[i]! - signalLineFull[i]!);
      } else {
          histogram.push(null);
      }
  }
  
  return { macdLine, signalLine: signalLineFull, histogram };
};