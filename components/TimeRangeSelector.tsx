
import React from 'react';
import { TimeRangeOption } from '../types';

interface TimeRangeSelectorProps {
  options: TimeRangeOption[];
  selectedRange: TimeRangeOption;
  onSelect: (option: TimeRangeOption) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ options, selectedRange, onSelect }) => {
  return (
    <div className="flex-shrink-0 bg-brand-secondary p-1 rounded-lg">
      <div className="flex items-center gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-brand-accent ${
              selectedRange.value === option.value
                ? 'bg-brand-accent text-white'
                : 'text-brand-subtle hover:bg-gray-700 hover:text-brand-text'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeSelector;
