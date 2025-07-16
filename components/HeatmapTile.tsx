import React from 'react';
import { DashboardCommodityData } from '../types';

type TileSize = 'large' | 'medium' | 'small';

interface HeatmapTileProps {
  data: DashboardCommodityData;
  onClick: () => void;
  size: TileSize;
}

const formatNumber = (num: number | undefined) => {
    if(typeof num !== 'number') return 'N/A';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const getHeatmapColor = (percentage: number): string => {
    if (isNaN(percentage)) {
        return 'hsl(240, 4%, 20%)'; // ~brand-secondary color
    }

    const clampedPercent = Math.max(-3, Math.min(3, percentage));

    if (Math.abs(clampedPercent) < 0.1) {
        return 'hsl(240, 4%, 20%)'; // Neutral color
    }
    
    const hue = clampedPercent > 0 ? 130 : 0; // Green for positive, Red for negative
    const saturation = 50 + Math.abs(clampedPercent) * 10; // from 50% to 80%
    const lightness = 40 - Math.abs(clampedPercent) * 5; // from 40% to 25%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}


const HeatmapTile: React.FC<HeatmapTileProps> = ({ data, onClick, size }) => {
    const { name, keyMetrics, chartData } = data;

    const sizeConfig = {
        large: {
            container: 'col-span-2 row-span-2 min-h-[16rem]',
            name: 'text-2xl',
            change: 'text-5xl',
            price: 'text-lg',
        },
        medium: {
            container: 'col-span-2 row-span-1 min-h-[8rem]',
            name: 'text-lg',
            change: 'text-3xl',
            price: 'text-base',
        },
        small: {
            container: 'col-span-1 row-span-1 min-h-[8rem]',
            name: 'text-sm',
            change: 'text-2xl',
            price: 'text-xs',
        }
    };

    const config = sizeConfig[size];

    if (!keyMetrics || !chartData || chartData.length === 0) {
        return (
            <div className={`bg-brand-secondary rounded-lg p-3 flex flex-col items-center justify-center text-center text-brand-subtle ${config.container}`}>
                <span className={`font-semibold break-all ${config.name}`}>{name.split(' (')[0]}</span>
                <span className="text-xs mt-1">데이터 없음</span>
            </div>
        );
    }
    
    const lastPrice = chartData[chartData.length - 1]?.price;
    const change = lastPrice - keyMetrics.previousClose;
    const changePercent = (change / keyMetrics.previousClose) * 100;
    const isPositive = change >= 0;

    const backgroundColor = getHeatmapColor(changePercent);

    return (
        <div
            onClick={onClick}
            className={`rounded-lg p-3 flex flex-col justify-between text-white cursor-pointer transition-all duration-300 hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-brand-accent ${config.container}`}
            style={{ backgroundColor }}
            role="button"
            tabIndex={0}
            aria-label={`${name}, 현재가 ${formatNumber(lastPrice)}, 변동률 ${changePercent.toFixed(2)}%`}
        >
            <h3 className={`font-bold leading-tight ${config.name}`}>{name.split(' (')[0]}</h3>
            
            <div className="text-center">
                <p className={`font-bold tracking-tight ${config.change}`}>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</p>
            </div>

            <p className={`opacity-80 ${config.price} flex items-baseline justify-end`}>
                <span>{formatNumber(lastPrice)}</span>
                {keyMetrics.currency && <span className="ml-1 text-[0.7em] opacity-80">{keyMetrics.currency}</span>}
            </p>
        </div>
    );
};

export default HeatmapTile;