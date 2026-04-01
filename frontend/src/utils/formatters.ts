import { EnergySource } from '../types';

export function formatCapacity(mw: number): string {
  if (mw >= 1000) return `${(mw / 1000).toFixed(1)} GW`;
  return `${mw.toLocaleString('en-IN')} MW`;
}

export function formatGW(gw: number): string {
  return `${gw.toFixed(1)} GW`;
}

export function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

const SOURCE_COLORS: Record<EnergySource, string> = {
  solar: 'text-amber-500',
  wind: 'text-blue-500',
  hydro: 'text-cyan-500',
  biomass: 'text-emerald-500',
  geothermal: 'text-red-500',
};

export function getSourceColor(source: EnergySource): string {
  return SOURCE_COLORS[source] ?? 'text-gray-500';
}

const SOURCE_BG_COLORS: Record<EnergySource, string> = {
  solar: 'bg-amber-500',
  wind: 'bg-blue-500',
  hydro: 'bg-cyan-500',
  biomass: 'bg-emerald-500',
  geothermal: 'bg-red-500',
};

export function getSourceBgColor(source: EnergySource): string {
  return SOURCE_BG_COLORS[source] ?? 'bg-gray-500';
}

const SOURCE_HEX: Record<EnergySource, string> = {
  solar: '#F59E0B',
  wind: '#3B82F6',
  hydro: '#06B6D4',
  biomass: '#10B981',
  geothermal: '#EF4444',
};

export function getSourceHexColor(source: EnergySource): string {
  return SOURCE_HEX[source] ?? '#9CA3AF';
}

const SOURCE_ICONS: Record<EnergySource, string> = {
  solar: '☀️',
  wind: '💨',
  hydro: '💧',
  biomass: '🌿',
  geothermal: '🌋',
};

export function getSourceIcon(source: EnergySource): string {
  return SOURCE_ICONS[source] ?? '⚡';
}

export function formatCO2(tons: number): string {
  if (tons >= 1_000_000) return `${(tons / 1_000_000).toFixed(2)} MT`;
  if (tons >= 1000) return `${(tons / 1000).toFixed(1)} KT`;
  return `${tons.toLocaleString('en-IN')} T`;
}

export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return +((( current - previous) / previous) * 100).toFixed(1);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
}
