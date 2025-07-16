import React, { useState, useEffect, useCallback } from 'react';
import { COMMODITIES } from '../constants';
import { fetchCommodityData } from '../services/yahooFinanceService';
import { Commodity, DashboardCommodityData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import CommodityCard from './CommodityCard';
import HeatmapTile from './HeatmapTile';

interface DashboardViewProps {
  onSelectCommodity: (commodity: Commodity) => void;
}

const RefreshIcon: React.FC<{ isSpinning: boolean }> = ({ isSpinning }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-brand-subtle transition-transform duration-500 ${isSpinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10M20 20l-1.5-1.5A9 9 0 003.5 14" />
    </svg>
);

const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const SquaresIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1V4a1 1 0 00-1-1H3zm10 0a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1V4a1 1 0 00-1-1h-5zM3 12a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1v-5a1 1 0 00-1-1H3zm10 0a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1v-5a1 1 0 00-1-1h-5z" clipRule="evenodd" />
    </svg>
);

type TileSize = 'large' | 'medium' | 'small';

const DashboardView: React.FC<DashboardViewProps> = ({ onSelectCommodity }) => {
  const [dashboardData, setDashboardData] = useState<DashboardCommodityData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For initial load
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'heatmap'>('card');

  const fetchAllData = useCallback(async () => {
    setError(null);
    try {
      const dataPromises = COMMODITIES.map(commodity => 
        fetchCommodityData(commodity.ticker, '5d').then(data => {
          const price = data.keyMetrics?.previousClose ?? 0;
          const volume = data.keyMetrics?.regularMarketVolume ?? 0;
          const tradingValue = price * volume;

          return {
            ...commodity,
            ...data,
            tradingValue: tradingValue || 0,
          }
        })
      );
      let allData = await Promise.all(dataPromises);
      
      const validData = allData.filter(d => d.tradingValue > 0);
      const zeroData = allData.filter(d => d.tradingValue <= 0);

      validData.sort((a, b) => b.tradingValue - a.tradingValue);

      setDashboardData([...validData, ...zeroData]);
      setLastUpdated(new Date());
    } catch (err) {
      setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
  }, [fetchAllData]);
  
  // Initial data fetch
  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await fetchAllData();
      setIsLoading(false);
    }
    initialFetch();
  }, [fetchAllData]);

  // Auto-refresh every 1 minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleRefresh();
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [handleRefresh]);

  const getTileSize = (index: number): TileSize => {
      if (index === 0) return 'large';
      if (index >= 1 && index <= 3) return 'medium';
      return 'small';
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <LoadingSpinner />
            <p className="mt-4 text-brand-subtle">원자재 데이터를 불러오는 중...</p>
        </div>
    );
  }

  if (error && dashboardData.length === 0) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
            <div className="flex-1">
                <h1 className="text-3xl font-bold text-brand-text">전체 현황</h1>
                <p className="text-brand-subtle mt-1">
                    {viewMode === 'card' 
                        ? '모든 원자재의 실시간 시세를 확인하고 상세 정보를 살펴보세요.'
                        : '전체 자산의 등락률과 거래 규모를 히트맵으로 한눈에 파악하세요.'
                    }
                </p>
            </div>
            
            <div className="flex items-center gap-4 self-start md:self-center">
                <div className="flex items-center gap-1 bg-brand-secondary p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('card')}
                        title="카드 뷰"
                        className={`p-1.5 rounded-md transition-colors duration-200 ${viewMode === 'card' ? 'bg-brand-accent text-white' : 'text-brand-subtle hover:bg-gray-700'}`}
                        aria-label="카드 뷰"
                    >
                        <GridIcon className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('heatmap')}
                        title="히트맵 뷰"
                        className={`p-1.5 rounded-md transition-colors duration-200 ${viewMode === 'heatmap' ? 'bg-brand-accent text-white' : 'text-brand-subtle hover:bg-gray-700'}`}
                        aria-label="히트맵 뷰"
                    >
                        <SquaresIcon className="h-5 w-5" />
                    </button>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-3 py-2 bg-brand-secondary text-brand-text rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-wait transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary focus:ring-brand-accent"
                    aria-label="새로고침"
                >
                    <RefreshIcon isSpinning={isRefreshing} />
                    <span className="hidden sm:inline">{isRefreshing ? '갱신 중...' : '새로고침'}</span>
                </button>
            </div>
        </div>
        <div className="flex justify-end mb-6">
             {lastUpdated && (
                <p className="text-sm text-brand-subtle">
                    마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')} (1분단위 자동갱신)
                </p>
            )}
        </div>
        
      {error && !isRefreshing && <ErrorMessage message={error} />}
      
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {dashboardData.map(data => (
            <CommodityCard
                key={data.ticker}
                data={data}
                onClick={() => onSelectCommodity({ ticker: data.ticker, name: data.name })}
            />
            ))}
        </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3" style={{ gridAutoFlow: 'dense' }}>
            {dashboardData.map((data, index) => (
                <HeatmapTile
                    key={data.ticker}
                    data={data}
                    onClick={() => onSelectCommodity({ ticker: data.ticker, name: data.name })}
                    size={getTileSize(index)}
                />
            ))}
        </div>
        )}
    </div>
  );
};

export default DashboardView;