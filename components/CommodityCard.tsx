
import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DashboardCommodityData } from '../types';

interface CommodityCardProps {
  data: DashboardCommodityData;
  onClick: () => void;
}

const formatNumber = (num: number | undefined) => {
    if(typeof num !== 'number') return 'N/A';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CommodityCard: React.FC<CommodityCardProps> = ({ data, onClick }) => {
  const { name, keyMetrics, chartData } = data;
  
  if (!keyMetrics || !chartData || chartData.length === 0) {
    return (
        <div className="bg-brand-secondary p-4 rounded-lg shadow-lg h-48 flex flex-col items-center justify-center text-center text-brand-subtle">
            <span className="font-semibold">{name}</span>
            <span>데이터 로딩 실패</span>
        </div>
    );
  }

  const lastPrice = chartData[chartData.length - 1]?.price;
  const change = lastPrice - keyMetrics.previousClose;
  const changePercent = (change / keyMetrics.previousClose) * 100;
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const gradientColor = isPositive ? "#22c55e" : "#ef4444";
  const gradientId = `sparkline-gradient-${data.ticker.replace(/=/g, '')}`;

  return (
    <div
      onClick={onClick}
      className="bg-brand-secondary p-4 rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gray-700/50 group flex flex-col justify-between h-48"
    >
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-brand-text mb-1 w-2/3 break-words">{name}</h3>
          <div className="h-12 w-1/3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
                      </linearGradient>
                  </defs>
                  <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={gradientColor} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill={`url(#${gradientId})`}
                      dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold text-brand-text">{formatNumber(lastPrice)}</p>
        <div className={`flex items-center gap-2 text-md font-medium ${changeColor}`}>
          <span>{isPositive ? '▲' : '▼'} {formatNumber(Math.abs(change))}</span>
          <span>({changePercent.toFixed(2)}%)</span>
        </div>
      </div>
    </div>
  );
};

export default CommodityCard;
