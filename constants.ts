import { Commodity, TimeRangeOption } from './types';

export const COMMODITIES: Commodity[] = [
  { ticker: 'CL=F', name: '원유 (Crude Oil)' },
  { ticker: 'GC=F', name: '금 (Gold)' },
  { ticker: 'SI=F', name: '은 (Silver)' },
  { ticker: 'NG=F', name: '천연가스 (Natural Gas)' },
  { ticker: 'HG=F', name: '구리 (Copper)' },
  { ticker: 'ZC=F', name: '옥수수 (Corn)' },
  { ticker: 'ZW=F', name: '밀 (Wheat)' },
  { ticker: 'ZS=F', name: '대두 (Soybeans)' },
  { ticker: 'PL=F', name: '백금 (Platinum)' },
  { ticker: 'PA=F', name: '팔라듐 (Palladium)' },
  { ticker: 'KC=F', name: '커피 (Coffee)' },
  { ticker: 'CC=F', name: '코코아 (Cocoa)' },
  { ticker: 'SB=F', name: '설탕 (Sugar)' },
  { ticker: 'CT=F', name: '면화 (Cotton)' },
];

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { label: '1일', value: '1d' },
  { label: '5일', value: '5d' },
  { label: '1개월', value: '1mo' },
  { label: '6개월', value: '6mo' },
  { label: '1년', value: '1y' },
  { label: '5년', value: '5y' },
];

export const COLORS = ['#4f46e5', '#22c55e', '#ef4444', '#eab308', '#3b82f6', '#a855f7', '#f97316', '#14b8a6'];