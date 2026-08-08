import { Coins } from 'lucide-react';
import React from 'react';

interface ShopGridProps {
    items: any[];
    inventory: string[];
    coins: number;
    onBuyClick: (item: any) => void;
}

export default function ShopGrid({ items, inventory, coins, onBuyClick }: ShopGridProps) {
    return (
        <div className="p-4 animate-fadeIn">
            <div className="grid grid-cols-2 gap-4">
                {items.map((item) => {
                    const isOwned = inventory.includes(item.id);
                    const canBuy = coins >= item.cost;

                    return (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl border-2 border-[#e2e8f0] shadow-[4px_4px_0px_#e2e8f0] p-4 flex flex-col gap-3"
                        >
                            <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain z-10" />
                                {/* Rarity Background Effect */}
                                {item.rarity === 'legendary' && <div className="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>}
                                {item.rarity === 'epic' && <div className="absolute inset-0 bg-purple-400/20 animate-pulse"></div>}
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-sm leading-tight mb-1">{item.name}</h4>
                                <p className="text-[10px] text-gray-500 line-clamp-2">{item.description}</p>
                            </div>

                            <button
                                className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all ${isOwned
                                    ? 'bg-gray-100 text-gray-400 cursor-default'
                                    : canBuy
                                        ? 'bg-[#0f172a] text-white active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                onClick={() => !isOwned && canBuy && onBuyClick(item)}
                                disabled={isOwned || !canBuy}
                            >
                                {isOwned ? (
                                    <>
                                        <span className="material-symbols-outlined text-sm">check</span>
                                        Dimiliki
                                    </>
                                ) : (
                                    <>
                                        <Coins className="w-4 h-4" />
                                        {item.cost}
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
