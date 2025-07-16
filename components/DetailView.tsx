import React, { useState, useEffect, useCallback } from 'react';
import CommoditySelector from './CommoditySelector';
import TimeRangeSelector from './TimeRangeSelector';
import PriceChart from './PriceChart';
import KeyMetrics from './KeyMetrics';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import IndicatorSelector from './IndicatorSelector';
import { fetchCommodityData } from '../services/yahooFinanceService';
import { calculateSMA, calculateRSI, calculateBollingerBands, calculateMACD } from '../utils/technicalIndicators';
import { COMMODITIES, TIME_RANGE_OPTIONS, COLORS } from '../constants';
import { Commodity, TimeRangeOption, ChartDataPoint, KeyMetricsData, NormalizedChartDataPoint } from '../types';

interface DetailViewProps {
  commodity: Commodity;
}

const DetailView: React.FC<DetailViewProps> = ({ commodity }) => {
  const [selectedCommodities, setSelectedCommodities] = useState<Commodity[]>([commodity]);
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>(TIME_RANGE_OPTIONS[4]); // Default to 1y
  const [chartData, setChartData] = useState<NormalizedChartDataPoint[]>([]);
  const [keyMetricsMap, setKeyMetricsMap] = useState<Record<string, KeyMetricsData | null>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [indicators, setIndicators] = useState({
    ma5: false,
    ma20: false,
    rsi: false,
    bb: false,
    macd: false,
    volume: true,
  });

  const handleToggleIndicator = (indicator: keyof typeof indicators) => {
    setIndicators(prev => ({ ...prev, [indicator]: !prev[indicator] }));
  };

  const handleToggleCommodity = (toggledCommodity: Commodity) => {
    setSelectedCommodities(prev => {
      const isSelected = prev.some(c => c.ticker === toggledCommodity.ticker);
      if (isSelected) {
        if (prev.length === 1) return prev; // Don't allow deselecting the last one
        return prev.filter(c => c.ticker !== toggledCommodity.ticker);
      }
      return [...prev, toggledCommodity];
    });
  };
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedCommodities.length > 1) {
        setIndicators(prev => ({ ...prev, ma5: false, ma20: false, rsi: false, bb: false, macd: false, volume: false }));
      }

      const dataPromises = selectedCommodities.map(c => 
        fetchCommodityData(c.ticker, selectedRange.value)
      );
      
      const results = await Promise.allSettled(dataPromises);

      const newKeyMetricsMap: Record<string, KeyMetricsData | null> = {};
      const rawChartDataSets: Record<string, ChartDataPoint[]> = {};
      
      results.forEach((result, index) => {
        const ticker = selectedCommodities[index].ticker;
        if (result.status === 'fulfilled') {
            newKeyMetricsMap[ticker] = result.value.keyMetrics;
            rawChartDataSets[ticker] = result.value.chartData;
        } else {
            console.error(`Failed to fetch data for ${ticker}:`, result.reason);
            setError(`${ticker} 데이터를 불러오는데 실패했습니다.`);
        }
      });
      setKeyMetricsMap(newKeyMetricsMap);
      
      const successfulTickers = Object.keys(rawChartDataSets);
      const successfulCommodities = selectedCommodities.filter(c => successfulTickers.includes(c.ticker));

      if (successfulCommodities.length === 0) {
        setChartData([]);
        throw new Error("모든 원자재 데이터를 불러오는데 실패했습니다.");
      }

      if (successfulCommodities.length === 1) {
          const singleTicker = successfulCommodities[0].ticker;
          const singleRawChartData = rawChartDataSets[singleTicker];

          const sma5 = calculateSMA(singleRawChartData, 5);
          const sma20 = calculateSMA(singleRawChartData, 20);
          const rsi14 = calculateRSI(singleRawChartData, 14);
          const { middle, upper, lower } = calculateBollingerBands(singleRawChartData);
          const { macdLine, signalLine, histogram } = calculateMACD(singleRawChartData);

          const dataWithIndicators = singleRawChartData.map((d, i) => ({
              time: d.time,
              [singleTicker]: d.price,
              volume: d.volume,
              SMA5: sma5[i],
              SMA20: sma20[i],
              RSI14: rsi14[i],
              BB_UPPER: upper[i],
              BB_MIDDLE: middle[i],
              BB_LOWER: lower[i],
              MACD_LINE: macdLine[i],
              MACD_SIGNAL: signalLine[i],
              MACD_HISTOGRAM: histogram[i],
          }));

          setChartData(dataWithIndicators);
      } else {
        const allTimestamps = new Set<number>();
        Object.values(rawChartDataSets).forEach(dataSet => {
          dataSet.forEach(point => allTimestamps.add(point.time));
        });
        const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

        const normalizedDataSets: Record<string, Record<number, number>> = {};
        Object.entries(rawChartDataSets).forEach(([ticker, dataSet]) => {
          if (dataSet.length === 0) return;
          const firstPoint = dataSet.find(p => p.price != null);
          const basePrice = firstPoint ? firstPoint.price : 0;
          if(basePrice > 0) {
            normalizedDataSets[ticker] = {};
            dataSet.forEach(point => {
                if(point.price != null) {
                    normalizedDataSets[ticker][point.time] = (point.price / basePrice) * 100;
                }
            });
          }
        });
        
        const mergedData: NormalizedChartDataPoint[] = [];
        for (const time of sortedTimestamps) {
            const dataPoint: NormalizedChartDataPoint = { time };
            const lastDataPoint = mergedData[mergedData.length - 1];

            for (const c of successfulCommodities) {
                const ticker = c.ticker;
                if (normalizedDataSets[ticker]?.[time] !== undefined) {
                    dataPoint[ticker] = normalizedDataSets[ticker][time];
                } else if (lastDataPoint?.[ticker] !== undefined) {
                    dataPoint[ticker] = lastDataPoint[ticker];
                }
            }
            mergedData.push(dataPoint);
        }
        
        const firstCompleteIndex = mergedData.findIndex(p => successfulCommodities.every(c => p[c.ticker] !== undefined));
        setChartData(firstCompleteIndex === -1 ? [] : mergedData.slice(firstCompleteIndex));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCommodities, selectedRange]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Reset indicators to default when commodity selection changes back to a single commodity
    if (selectedCommodities.length === 1) {
        if(commodity.ticker !== selectedCommodities[0].ticker){
           setSelectedCommodities([commodity]);
        } else {
           setIndicators({
            ma5: false,
            ma20: false,
            rsi: false,
            bb: false,
            macd: false,
            volume: true,
          });
        }
    } else {
       // On navigating back to multi-view from single commodity, ensure we have the primary one
       if (!selectedCommodities.some(c => c.ticker === commodity.ticker)) {
         setSelectedCommodities(prev => [commodity, ...prev.filter(c => c.ticker !== commodity.ticker)]);
       }
    }
  }, [commodity, selectedCommodities.length]);


  const primaryCommodityTicker = selectedCommodities[0]?.ticker;
  const primaryMetrics = primaryCommodityTicker ? keyMetricsMap[primaryCommodityTicker] : null;
  const lastDataPoint = chartData[chartData.length - 1];
  const lastPrice = primaryCommodityTicker && lastDataPoint ? lastDataPoint[primaryCommodityTicker] : undefined;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <h2 className="text-2xl font-bold text-brand-text">
            {selectedCommodities.length > 1 ? '원자재 비교' : `${selectedCommodities[0].name} 상세 정보`}
        </h2>
        <TimeRangeSelector
          options={TIME_RANGE_OPTIONS}
          selectedRange={selectedRange}
          onSelect={setSelectedRange}
        />
      </div>
      <p className="text-brand-subtle mb-6 text-sm md:text-base">
        {selectedCommodities.length > 1 
          ? '차트에 여러 원자재를 추가하여 가격 변동률을 비교해보세요. (차트 시작점 100 기준)' 
          : '다른 원자재를 선택하여 비교 차트를 생성하거나, 기술적 지표를 추가하여 분석할 수 있습니다.'
        }
      </p>

      <div className="mb-6">
        <CommoditySelector
          commodities={COMMODITIES}
          selectedCommodities={selectedCommodities}
          onToggle={handleToggleCommodity}
        />
      </div>

      <div className="mb-6">
        <IndicatorSelector
          indicators={indicators}
          onToggle={handleToggleIndicator}
          disabled={selectedCommodities.length > 1}
        />
      </div>
      
      {error && !isLoading && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-brand-secondary p-4 rounded-lg shadow-lg flex flex-col h-[400px] md:h-[500px] lg:h-[600px]">
          {isLoading ? <LoadingSpinner /> : <PriceChart 
                data={chartData} 
                series={selectedCommodities.filter(c => Object.keys(keyMetricsMap).includes(c.ticker))}
                indicators={indicators} 
            />}
        </div>
        <div className="lg:col-span-1 bg-brand-secondary p-4 rounded-lg shadow-lg">
          {isLoading ? <LoadingSpinner /> : (
            <div>
              {primaryMetrics && (
                <KeyMetrics 
                  metrics={primaryMetrics} 
                  lastPrice={lastPrice as number | undefined} 
                  commodityName={selectedCommodities[0].name} 
                />
              )}
              {selectedCommodities.length > 1 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-brand-text border-b border-gray-700 pb-2 mb-3">선택된 원자재</h3>
                  <ul className="space-y-2">
                    {selectedCommodities.map((c, index) => (
                      <li key={c.ticker} className="flex items-center text-brand-text text-sm">
                        <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        {c.name.split(' (')[0]}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailView;