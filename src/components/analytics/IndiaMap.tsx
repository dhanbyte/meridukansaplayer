"use client";

import React, { useState } from 'react';
import india from '@svg-maps/india';

interface StateData {
    stateCode: string;
    stateName: string;
    totalOrders: number;
    deliveredOrders: number;
    rtoOrders: number;
    rtoRate: number;
    profit: number;
}

interface IndiaMapProps {
    data: StateData[];
    onStateClick?: (stateCode: string) => void;
    selectedState?: string | null;
    colorMode?: 'orders' | 'profit' | 'rto';
}

// Map Application State Codes (e.g., 'MH') to SVG Map IDs (e.g., 'mh')
const STATE_CODE_MAPPING: Record<string, string> = {
    'AN': 'an', 'AP': 'ap', 'AR': 'ar', 'AS': 'as', 'BR': 'br', 'CH': 'ch',
    'CT': 'ct', 'DN': 'dn', 'DD': 'dd', 'DL': 'dl', 'GA': 'ga', 'GJ': 'gj',
    'HR': 'hr', 'HP': 'hp', 'JK': 'jk', 'JH': 'jh', 'KA': 'ka', 'KL': 'kl',
    'LA': 'jk', // Map Ladakh to J&K as per map data
    'LD': 'ld', 'MP': 'mp', 'MH': 'mh', 'MN': 'mn', 'ML': 'ml', 'MZ': 'mz',
    'NL': 'nl', 'OR': 'or', 'PY': 'py', 'PB': 'pb', 'RJ': 'rj', 'SK': 'sk',
    'TN': 'tn', 'TG': 'tg', 'TR': 'tr', 'UP': 'up', 'UK': 'uk', 'WB': 'wb'
};

const normalizeCode = (code: string) => STATE_CODE_MAPPING[code.toUpperCase()] || code.toLowerCase();

export default function IndiaMap({ data, onStateClick, selectedState, colorMode = 'orders' }: IndiaMapProps) {
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Get max values for color scaling
    const maxOrders = Math.max(...data.map(s => s.totalOrders), 1);
    const maxProfit = Math.max(...data.map(s => s.profit), 1);
    const maxRto = Math.max(...data.map(s => s.rtoRate), 1);

    // Create a map for quick lookup - normalize keys to lowercase
    const stateDataMap: Record<string, StateData> = {};
    data.forEach(state => {
        const mapId = normalizeCode(state.stateCode);
        if (stateDataMap[mapId]) {
            // Merge data if multiple states map to one ID (e.g. LA + JK)
            stateDataMap[mapId] = {
                ...stateDataMap[mapId],
                totalOrders: stateDataMap[mapId].totalOrders + state.totalOrders,
                deliveredOrders: stateDataMap[mapId].deliveredOrders + state.deliveredOrders,
                rtoOrders: stateDataMap[mapId].rtoOrders + state.rtoOrders,
                profit: stateDataMap[mapId].profit + state.profit,
                // Recalculate rates
                rtoRate: Math.round(((stateDataMap[mapId].rtoOrders + state.rtoOrders) / (stateDataMap[mapId].totalOrders + state.totalOrders)) * 100) || 0
            };
        } else {
            stateDataMap[mapId] = state;
        }
    });

    // Get color based on mode and value
    const getStateColor = (mapId: string): string => {
        const stateData = stateDataMap[mapId];
        const isSelected = selectedState && normalizeCode(selectedState) === mapId;
        const isHovered = hoveredState === mapId;

        if (!stateData || stateData.totalOrders === 0) {
            return isHovered ? '#D1D5DB' : '#E5E7EB'; // Gray for no data
        }

        let intensity = 0;

        switch (colorMode) {
            case 'profit':
                intensity = Math.min(stateData.profit / maxProfit, 1);
                if (intensity > 0.7) return isHovered ? '#14532D' : '#166534';
                if (intensity > 0.4) return isHovered ? '#166534' : '#22C55E';
                return isHovered ? '#22C55E' : '#86EFAC';
            case 'rto':
                intensity = Math.min(stateData.rtoRate / Math.max(maxRto, 30), 1);
                if (intensity > 0.6) return isHovered ? '#7F1D1D' : '#DC2626';
                if (intensity > 0.3) return isHovered ? '#DC2626' : '#F87171';
                return isHovered ? '#F87171' : '#FECACA';
            case 'orders':
            default:
                intensity = Math.min(stateData.totalOrders / maxOrders, 1);
                if (intensity > 0.7) return isHovered ? '#1E3A8A' : '#2563EB';
                if (intensity > 0.4) return isHovered ? '#2563EB' : '#60A5FA';
                return isHovered ? '#60A5FA' : '#BFDBFE';
        }
    };

    const handleMouseMove = (e: React.MouseEvent, mapId: string) => {
        const rect = e.currentTarget.closest('svg')?.getBoundingClientRect();
        if (rect) {
            setTooltipPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
        setHoveredState(mapId);
    };

    const displayId = hoveredState || (selectedState ? normalizeCode(selectedState) : null);
    const displayData = displayId ? stateDataMap[displayId] : null;
    const displayName = displayId ? india.locations.find((l: any) => l.id === displayId)?.name : '';

    // Special label for J&K to indicate Ladakh inclusion
    const tooltipLabel = displayId === 'jk' ? 'Jammu & Kashmir (incl. Ladakh)' : displayName;

    return (
        <div className="relative w-full h-full flex justify-center">
            <svg
                viewBox={india.viewBox}
                className="w-full h-auto max-h-[500px]"
                style={{ background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)' }}
            >
                {/* Title */}
                <text x="50%" y="20" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1E40AF">
                    India - State Performance Map
                </text>

                <g transform="translate(0, 30)">
                    {india.locations.map((location: any) => {
                        const fillColor = getStateColor(location.id);
                        const isSelected = selectedState && normalizeCode(selectedState) === location.id;
                        const isHovered = hoveredState === location.id;

                        return (
                            <path
                                key={location.id}
                                id={location.id}
                                name={location.name}
                                d={location.path}
                                fill={fillColor}
                                stroke={isSelected ? '#000' : isHovered ? '#374151' : '#9CA3AF'}
                                strokeWidth={isSelected ? 1.5 : isHovered ? 1 : 0.5}
                                className="cursor-pointer transition-all duration-200 outline-none"
                                onClick={() => onStateClick?.(location.id.toUpperCase())}
                                onMouseEnter={(e) => handleMouseMove(e, location.id)}
                                onMouseMove={(e) => handleMouseMove(e, location.id)}
                                onMouseLeave={() => setHoveredState(null)}
                                style={{
                                    filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' :
                                        isHovered ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none'
                                }}
                            />
                        );
                    })}
                </g>

                {/* Legend */}
                <g transform={`translate(${parseInt(india.viewBox.split(' ')[2]) * 0.05}, ${parseInt(india.viewBox.split(' ')[3]) * 0.9})`}>
                    <rect x="0" y="0" width="300" height="35" rx="5" fill="rgba(255,255,255,0.9)" stroke="#E5E7EB" />
                    <text x="10" y="15" fontSize="12" fill="#374151" fontWeight="bold">
                        {colorMode === 'orders' ? '📦 Orders' : colorMode === 'profit' ? '💰 Profit' : '🔄 RTO Rate'}
                    </text>

                    <defs>
                        <linearGradient id={`legend-gradient-${colorMode}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={colorMode === 'rto' ? '#FECACA' : colorMode === 'profit' ? '#86EFAC' : '#BFDBFE'} />
                            <stop offset="50%" stopColor={colorMode === 'rto' ? '#F87171' : colorMode === 'profit' ? '#22C55E' : '#60A5FA'} />
                            <stop offset="100%" stopColor={colorMode === 'rto' ? '#DC2626' : colorMode === 'profit' ? '#166534' : '#2563EB'} />
                        </linearGradient>
                    </defs>
                    <rect x="100" y="8" width="100" height="12" rx="2" fill={`url(#legend-gradient-${colorMode})`} />
                    <text x="100" y="28" fontSize="10" fill="#6B7280">Low</text>
                    <text x="190" y="28" fontSize="10" fill="#6B7280" textAnchor="end">High</text>
                </g>
            </svg>

            {/* Floating Tooltip */}
            {displayId && displayData && (
                <div
                    className="absolute bg-white p-4 rounded-xl shadow-2xl border-2 border-gray-100 text-sm z-50 min-w-[200px]"
                    style={{
                        top: '10px',
                        right: '10px',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-lg text-gray-800">{tooltipLabel}</p>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono uppercase">{displayId}</span>
                    </div>
                    <div className="space-y-2 border-t pt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">📦 Total Orders</span>
                            <span className="font-bold text-blue-600">{displayData.totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">✅ Delivered</span>
                            <span className="font-bold text-green-600">{displayData.deliveredOrders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">🔄 RTO</span>
                            <span className={`font-bold ${displayData.rtoRate > 20 ? 'text-red-600' : 'text-orange-500'}`}>
                                {displayData.rtoOrders} ({displayData.rtoRate}%)
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2 mt-2">
                            <span className="text-gray-600">💰 Profit</span>
                            <span className="font-bold text-emerald-600">₹{displayData.profit?.toLocaleString()}</span>
                        </div>
                    </div>
                    {displayData.rtoRate > 20 && (
                        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-xs text-red-700">⚠️ High RTO Zone</p>
                        </div>
                    )}
                </div>
            )}
            {displayId && !displayData && (
                <div
                    className="absolute bg-white p-3 rounded-lg shadow-xl border border-gray-200 text-sm z-50"
                    style={{ top: '10px', right: '10px' }}
                >
                    <p className="font-bold text-gray-800">{displayName}</p>
                    <p className="text-gray-500 text-xs italic">No data available</p>
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
