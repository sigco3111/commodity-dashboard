import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, 
    BarChart, Bar, ComposedChart, Cell
} from 'recharts';
import { NormalizedChartDataPoint, Commodity } from '../types';
import { COLORS } from '../constants';

interface PriceChartProps {
    data: NormalizedChartDataPoint[];
    series: Commodity[];
    indicators: {
        ma5: boolean;
        ma20: boolean;
        rsi: boolean;
        bb: boolean;
        macd: boolean;
        volume: boolean;
    };
}

const CustomTooltip = ({ active, payload, label, series }: any) => {
  if (active && payload && payload.length) {
    const isMultiSeries = series.length > 1;
    return (
      <div className="bg-brand-secondary/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700 shadow-lg">
        <p className="label text-brand-subtle">{new Date(label).toLocaleString()}</p>
        {payload.map((pld: any, index: number) => {
            if (pld.value === null || pld.value === undefined) return null;

            const name = pld.name;
            let valueText;

            // Special handling for histogram
            if (pld.dataKey === 'MACD_HISTOGRAM') {
                return (
                 <p key={`${pld.dataKey}-${index}`} className="intro font-semibold" style={{ color: pld.fill }}>
                   {`히스토그램: ${pld.value.toFixed(2)}`}
                 </p>
               );
            }

            if (pld.dataKey?.startsWith('SMA') || pld.dataKey === 'RSI14' || pld.dataKey?.startsWith('BB_') || pld.dataKey?.startsWith('MACD_')) {
                valueText = pld.value.toFixed(2);
            } else if (pld.dataKey === 'volume') {
                valueText = pld.value.toLocaleString();
            } else {
                valueText = isMultiSeries ? pld.value.toFixed(2) : `$${pld.value.toFixed(2)}`;
            }
           
           return (
             <p key={`${pld.dataKey}-${index}`} className="intro font-semibold" style={{ color: pld.stroke || pld.color }}>
               {`${name}: ${valueText}`}
             </p>
           );
        })}
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ data, series, indicators }) => {
  if (!data || data.length === 0 || series.length === 0) {
    return <div className="flex items-center justify-center h-full text-brand-subtle">차트 데이터가 없습니다.</div>;
  }
  
  const isMultiSeries = series.length > 1;

  const showVolume = !isMultiSeries && indicators.volume;
  const showRSI = !isMultiSeries && indicators.rsi;
  const showMACD = !isMultiSeries && indicators.macd;
  const showBB = !isMultiSeries && indicators.bb;
  
  const subChartCount = [showVolume, showRSI, showMACD].filter(Boolean).length;
  
  let mainChartHeightPercent = 100;
  let subChartHeightPercent = 0;

  if (subChartCount === 1) {
    mainChartHeightPercent = 70;
    subChartHeightPercent = 30;
  } else if (subChartCount === 2) {
    mainChartHeightPercent = 60;
    subChartHeightPercent = 20;
  } else if (subChartCount === 3) {
    mainChartHeightPercent = 50;
    subChartHeightPercent = 16.66;
  }


  const showLegend = isMultiSeries || !isMultiSeries && (indicators.ma5 || indicators.ma20 || showBB);

  const allValues = data.flatMap(d => series.map(s => d[s.ticker]).filter(v => v != null)) as number[];
  const minPrice = Math.min(...allValues);
  const maxPrice = Math.max(...allValues);
  const yDomain: [number | string, number | string] = [
      isMultiSeries ? 'auto' : Math.floor(minPrice * 0.98), 
      isMultiSeries ? 'auto' : Math.ceil(maxPrice * 1.02)
  ];
  
  return (
    <>
      <ResponsiveContainer width="100%" height={`${mainChartHeightPercent}%`}>
        <LineChart
          data={data}
          syncId="priceSync"
          margin={{
            top: 5,
            right: 20,
            left: 5,
            bottom: showLegend ? 20 : 5, 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            tickFormatter={(time) => new Date(time).toLocaleDateString()}
            dy={10}
            height={subChartCount > 0 ? 1 : undefined}
            tickLine={subChartCount === 0}
            axisLine={subChartCount === 0}
          />
          <YAxis 
              stroke="#9ca3af"
              domain={yDomain}
              tickFormatter={(value) => isMultiSeries ? `${Number(value).toFixed(0)}` : `$${Number(value).toFixed(2)}`}
              dx={-10}
              label={isMultiSeries ? { value: 'Normalized (start = 100)', angle: -90, position: 'insideLeft', fill: '#9ca3af', style: {textAnchor: 'middle'} } : undefined}
          />
          <Tooltip content={<CustomTooltip series={series} />} />
          {showLegend && <Legend wrapperStyle={{ bottom: -5 }} />}
          
          {series.map((s, index) => (
              <Line
                  key={s.ticker}
                  type="monotone"
                  dataKey={s.ticker}
                  name={s.name.split(' (')[0]}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
              />
          ))}

          {!isMultiSeries && indicators.ma5 && (
            <Line
                key="SMA5"
                type="monotone"
                dataKey="SMA5"
                name="5일 MA"
                stroke="#f97316"
                strokeWidth={1.5}
                dot={false}
                connectNulls
            />
          )}
          {!isMultiSeries && indicators.ma20 && !showBB && (
            <Line
                key="SMA20"
                type="monotone"
                dataKey="SMA20"
                name="20일 MA"
                stroke="#eab308"
                strokeWidth={1.5}
                dot={false}
                connectNulls
            />
          )}
           {showBB && (
            <>
              <Line key="BB_UPPER" type="monotone" dataKey="BB_UPPER" name="BB Upper" stroke="rgba(79, 70, 229, 0.5)" strokeWidth={1} dot={false} connectNulls />
              <Line key="BB_MIDDLE" type="monotone" dataKey="BB_MIDDLE" name="BB Middle" stroke="#eab308" strokeWidth={1.5} dot={false} connectNulls />
              <Line key="BB_LOWER" type="monotone" dataKey="BB_LOWER" name="BB Lower" stroke="rgba(79, 70, 229, 0.5)" strokeWidth={1} dot={false} connectNulls />
            </>
          )}

        </LineChart>
      </ResponsiveContainer>
      
      {showVolume && (
        <ResponsiveContainer width="100%" height={`${subChartHeightPercent}%`}>
          <BarChart data={data} syncId="priceSync" margin={{ top: 10, right: 20, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
            <XAxis dataKey="time" hide={true} />
            <YAxis stroke="#9ca3af" orientation="left" dx={-10} tickFormatter={(vol) => typeof vol === 'number' ? (vol/1000000).toFixed(1) + 'M' : ''}
                label={{ value: '거래량', angle: -90, position: 'insideLeft', fill: '#9ca3af', style: {textAnchor: 'middle'} }}
            />
            <Tooltip content={<CustomTooltip series={series} />} />
            <Bar dataKey="volume" name="거래량" fill="rgba(156, 163, 175, 0.5)" />
          </BarChart>
        </ResponsiveContainer>
      )}
      
      {showRSI && (
        <ResponsiveContainer width="100%" height={`${subChartHeightPercent}%`}>
            <LineChart
              data={data}
              syncId="priceSync"
              margin={{
                top: 10,
                right: 20,
                left: 5,
                bottom: 5,
              }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                <XAxis dataKey="time" hide={true} />
                <YAxis 
                    stroke="#9ca3af" 
                    domain={[0, 100]} 
                    ticks={[0, 30, 50, 70, 100]} 
                    dx={-10}
                    label={{ value: 'RSI', angle: -90, position: 'insideLeft', fill: '#9ca3af', style: {textAnchor: 'middle'} }}
                />
                <Tooltip content={<CustomTooltip series={series} />} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="2 2" />
                <Line
                    type="monotone"
                    dataKey="RSI14"
                    name="RSI (14)"
                    stroke="#a855f7" // Purple
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                />
            </LineChart>
        </ResponsiveContainer>
      )}

      {showMACD && (
          <ResponsiveContainer width="100%" height={`${subChartHeightPercent}%`}>
              <ComposedChart data={data} syncId="priceSync" margin={{ top: 10, right: 20, left: 5, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
                  <XAxis dataKey="time" hide={true} />
                  <YAxis stroke="#9ca3af" dx={-10}
                      label={{ value: 'MACD', angle: -90, position: 'insideLeft', fill: '#9ca3af', style: {textAnchor: 'middle'} }}
                  />
                  <Tooltip content={<CustomTooltip series={series} />} />
                  <Legend wrapperStyle={{ bottom: -5 }} />
                  <Bar dataKey="MACD_HISTOGRAM" name="히스토그램">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.MACD_HISTOGRAM && entry.MACD_HISTOGRAM >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="MACD_LINE" name="MACD" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls/>
                  <Line type="monotone" dataKey="MACD_SIGNAL" name="Signal" stroke="#f97316" strokeWidth={2} dot={false} connectNulls/>
              </ComposedChart>
          </ResponsiveContainer>
      )}
    </>
  );
};

export default PriceChart;