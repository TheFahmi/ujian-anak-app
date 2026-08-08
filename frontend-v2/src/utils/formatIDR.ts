/**
 * Format number as Indonesian Rupiah currency
 * @param value - Number to format
 * @returns Formatted string like "Rp 1.234.567"
 */
export function formatIDR(value: number): string {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'Rp 0';
    }
    
    // Round to nearest integer for display
    const rounded = Math.round(value);
    
    // Format with Indonesian locale (dots as thousand separators)
    const formatted = rounded.toLocaleString('id-ID');
    
    return `Rp ${formatted}`;
}

/**
 * Format large numbers with K/M/B suffix
 * @param value - Number to format
 * @returns Formatted string like "1.2K" or "3.5M"
 */
export function formatCompact(value: number): string {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toString();
}
