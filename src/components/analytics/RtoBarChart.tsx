"use client";

import React from 'react';

interface StateData {
    stateCode: string;
    stateName: string;
    totalOrders: number;
    deliveredOrders: number;
    rtoOrders: number;
    rtoRate: number;
}

interface RtoBarChartProps {
    data: StateData[];
    maxItems?: number;
}

export default function RtoBarChart({ data, maxItems = 8 }: RtoBarChartProps) {
    // Sort by total orders and take top items
    const sortedData = [...data]
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .slice(0, maxItems);

    const maxOrders = Math.max(...sortedData.map(s => s.totalOrders), 1);

    return (
        <div className="space-y-3">
            {sortedData.map((state) => {
                const deliveredWidth = (state.deliveredOrders / maxOrders) * 100;
                const rtoWidth = (state.rtoOrders / maxOrders) * 100;
                const isHighRto = state.rtoRate > 20;

                return (
                    <div key={state.stateCode} className="group">
                        {/* State Label */}
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                {state.stateName}
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-green-600">{state.deliveredOrders}</span>
                                <span className="text-gray-400">/</span>
                                <span className={isHighRto ? 'text-red-600 font-semibold' : 'text-red-500'}>
                                    {state.rtoOrders}
                                </span>
                                {isHighRto && (
                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                        {state.rtoRate}% RTO
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bar */}
                        <div className="h-6 bg-gray-100 rounded-lg overflow-hidden flex">
                            {/* Delivered Bar */}
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 flex items-center justify-end pr-1"
                                style={{ width: `${deliveredWidth}%` }}
                            >
                                {deliveredWidth > 15 && (
                                    <span className="text-[10px] text-white font-medium">
                                        {state.deliveredOrders}
                                    </span>
                                )}
                            </div>
                            {/* RTO Bar */}
                            <div
                                className={`h-full transition-all duration-500 flex items-center justify-start pl-1 ${isHighRto
                                        ? 'bg-gradient-to-r from-red-500 to-red-400'
                                        : 'bg-gradient-to-r from-orange-400 to-orange-300'
                                    }`}
                                style={{ width: `${rtoWidth}%` }}
                            >
                                {rtoWidth > 8 && (
                                    <span className="text-[10px] text-white font-medium">
                                        {state.rtoOrders}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-3 border-t">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-green-400"></div>
                    <span className="text-xs text-gray-600">Delivered</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-400 to-orange-300"></div>
                    <span className="text-xs text-gray-600">RTO</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-red-400"></div>
                    <span className="text-xs text-gray-600">High RTO (&gt;20%)</span>
                </div>
            </div>
        </div>
    );
}
