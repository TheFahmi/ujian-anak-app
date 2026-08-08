"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import CoinsHeader from '@/components/rewards/CoinsHeader';
import BadgeGrid from '@/components/rewards/BadgeGrid';
import ShopGrid from '@/components/rewards/ShopGrid';
import BadgeModal from '@/components/rewards/BadgeModal';
import BuyConfirmationModal from '@/components/rewards/BuyConfirmationModal';
import TopAppBar from '@/components/TopAppBar';
import { BADGES } from '@/utils/rewards';

export default function RewardsPage() {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<'badges' | 'shop'>('badges');
    const [coins, setCoins] = useState(0);
    const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
    const [inventory, setInventory] = useState<string[]>([]);
    const [shopItems, setShopItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedBadge, setSelectedBadge] = useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch user rewards
                const rewardsRes = await fetch(`/api/rewards/${user.id}`);
                const rewardsData = await rewardsRes.json();
                setCoins(rewardsData.coins || 0);
                setUnlockedBadges(rewardsData.badges || []);
                setInventory(rewardsData.inventory || []);

                // Fetch shop items
                const shopRes = await fetch('/api/shop');
                const shopData = await shopRes.json();
                setShopItems(shopData);
            } catch (err) {
                console.error(err);
                addToast('Gagal memuat data rewards', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, addToast]);

    const handleBuyItem = async () => {
        if (!selectedItem || !user) return;

        try {
            const res = await fetch('/api/shop/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, itemId: selectedItem.id })
            });
            const data = await res.json();

            if (data.success) {
                setCoins(data.coins);
                setInventory(data.inventory);
                addToast(`Berhasil membeli ${selectedItem.name}!`, 'success');
                setSelectedItem(null);
            } else {
                addToast(data.message || 'Gagal membeli item', 'error');
            }
        } catch (err) {
            addToast('Terjadi kesalahan saat membeli item', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Rewards...</div>;

    return (
        <>
            <TopAppBar title="Hadiah & Toko" showBack />

            <div className="max-w-md mx-auto">
                <CoinsHeader coins={coins} />

                {/* Tabs */}
                <div className="px-4 mb-4">
                    <div className="bg-white p-1 rounded-2xl border-2 border-[#e2e8f0] flex">
                        <button
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'badges'
                                ? 'bg-[#0f172a] text-white shadow-md'
                                : 'text-[#64748b] hover:bg-gray-50'
                                }`}
                            onClick={() => setActiveTab('badges')}
                        >
                            Lencana
                        </button>
                        <button
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'shop'
                                ? 'bg-[#0f172a] text-white shadow-md'
                                : 'text-[#64748b] hover:bg-gray-50'
                                }`}
                            onClick={() => setActiveTab('shop')}
                        >
                            Toko
                        </button>
                    </div>
                </div>

                {activeTab === 'badges' ? (
                    <BadgeGrid
                        badges={BADGES}
                        unlockedBadges={unlockedBadges}
                        onBadgeClick={setSelectedBadge}
                    />
                ) : (
                    <ShopGrid
                        items={shopItems}
                        inventory={inventory}
                        coins={coins}
                        onBuyClick={setSelectedItem}
                    />
                )}
            </div>

            {selectedBadge && (
                <BadgeModal
                    badge={selectedBadge}
                    onClose={() => setSelectedBadge(null)}
                />
            )}

            {selectedItem && (
                <BuyConfirmationModal
                    item={selectedItem}
                    coins={coins}
                    onConfirm={handleBuyItem}
                    onCancel={() => setSelectedItem(null)}
                />
            )}
        </>
    );
}
