import React from 'react';

interface IndicatorSelectorProps {
  indicators: {
    ma5: boolean;
    ma20: boolean;
    rsi: boolean;
    bb: boolean;
    macd: boolean;
    volume: boolean;
  };
  onToggle: (indicator: keyof IndicatorSelectorProps['indicators']) => void;
  disabled: boolean;
}

const IndicatorCheckbox: React.FC<{
    label: string;
    checked: boolean;
    onChange: () => void;
    disabled: boolean;
}> = ({ label, checked, onChange, disabled }) => (
    <label className={`flex items-center space-x-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-brand-text'}`}>
        <input 
            type="checkbox" 
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="h-4 w-4 bg-brand-secondary border-brand-subtle rounded text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-secondary"
        />
        <span className="text-sm font-medium">{label}</span>
    </label>
);

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({ indicators, onToggle, disabled }) => {
  return (
    <div className="bg-brand-secondary/50 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
      <div className="text-sm font-semibold text-brand-text flex-shrink-0">기술적 지표:</div>
      <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-brand-subtle">
        <IndicatorCheckbox
          label="5일 MA"
          checked={indicators.ma5}
          onChange={() => onToggle('ma5')}
          disabled={disabled}
        />
        <IndicatorCheckbox
          label="20일 MA"
          checked={indicators.ma20}
          onChange={() => onToggle('ma20')}
          disabled={disabled}
        />
        <IndicatorCheckbox
          label="볼린저 밴드"
          checked={indicators.bb}
          onChange={() => onToggle('bb')}
          disabled={disabled}
        />
        <IndicatorCheckbox
          label="거래량"
          checked={indicators.volume}
          onChange={() => onToggle('volume')}
          disabled={disabled}
        />
        <IndicatorCheckbox
          label="RSI (14)"
          checked={indicators.rsi}
          onChange={() => onToggle('rsi')}
          disabled={disabled}
        />
         <IndicatorCheckbox
          label="MACD"
          checked={indicators.macd}
          onChange={() => onToggle('macd')}
          disabled={disabled}
        />
      </div>
       {disabled && <p className="text-xs text-brand-subtle mt-2 sm:mt-0 sm:ml-auto">지표는 단일 원자재 선택 시에만 사용 가능합니다.</p>}
    </div>
  );
};

export default IndicatorSelector;