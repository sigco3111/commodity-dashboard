
import React from 'react';
import { Commodity } from '../types';

interface CommoditySelectorProps {
  commodities: Commodity[];
  selectedCommodities: Commodity[];
  onToggle: (commodity: Commodity) => void;
}

const CommoditySelector: React.FC<CommoditySelectorProps> = ({ commodities, selectedCommodities, onToggle }) => {
  return (
    <div className="flex-shrink-0">
      <div className="flex flex-wrap gap-2">
        {commodities.map((commodity) => {
          const isSelected = selectedCommodities.some(c => c.ticker === commodity.ticker);
          return (
            <button
              key={commodity.ticker}
              onClick={() => onToggle(commodity)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-primary focus:ring-brand-accent ${
                isSelected
                  ? 'bg-brand-accent text-white shadow-md'
                  : 'bg-brand-secondary text-brand-subtle hover:bg-gray-700 hover:text-brand-text'
              }`}
            >
              {commodity.name}
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default CommoditySelector;
