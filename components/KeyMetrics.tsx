import React from 'react';
import { KeyMetricsData } from '../types';

interface KeyMetricsProps {
  metrics: KeyMetricsData | null;
  lastPrice: number | undefined;
  commodityName: string;
}

const formatNumber = (num: number | undefined) => {
    if(typeof num !== 'number') return 'N/A';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MetricItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-3 border-b border-gray-700">
        <span className="text-sm text-brand-subtle">{label}</span>
        <span className="text-md font-semibold text-brand-text">{value}</span>
    </div>
);


const KeyMetrics: React.FC<KeyMetricsProps> = ({ metrics, lastPrice, commodityName }) => {
  if (!metrics || lastPrice === undefined) {
    return <div className="text-brand-subtle">주요 지표를 불러올 수 없습니다.</div>;
  }

  const change = lastPrice - metrics.previousClose;
  const changePercent = (change / metrics.previousClose) * 100;
  const isPositive = change >= 0;

  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const changeSymbol = isPositive ? '▲' : '▼';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-brand-text mb-1 flex items-baseline gap-2 flex-wrap">
            <span>{commodityName}</span>
            <span className="text-base font-medium text-brand-subtle">({metrics.symbol})</span>
        </h2>
        <p className="text-3xl font-bold text-brand-text">{formatNumber(lastPrice)}</p>
        <div className={`flex items-center gap-2 text-lg font-semibold ${changeColor}`}>
            <span>{changeSymbol} {formatNumber(Math.abs(change))}</span>
            <span>({changePercent.toFixed(2)}%)</span>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <MetricItem label="전일 종가" value={formatNumber(metrics.previousClose)} />
        <MetricItem label="시가" value={formatNumber(metrics.regularMarketOpen)} />
        <MetricItem label="고가" value={formatNumber(metrics.regularMarketDayHigh)} />
        <MetricItem label="저가" value={formatNumber(metrics.regularMarketDayLow)} />
        <MetricItem label="통화" value={metrics.currency} />
      </div>
    </div>
  );
};

export default KeyMetrics;