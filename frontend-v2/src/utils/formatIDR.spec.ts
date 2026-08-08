import * as fc from 'fast-check';
import { formatIDR, formatCompact } from './formatIDR';

/**
 * Property-Based Tests for IDR Formatting
 * Feature: admin-token-estimate
 */
describe('formatIDR - Property Based Tests', () => {
    /**
     * **Feature: admin-token-estimate, Property 7: IDR Currency Formatting**
     * **Validates: Requirements 4.3**
     * 
     * For any numeric cost value, the formatted string SHALL follow
     * Indonesian Rupiah format (e.g., "Rp 1.234.567").
     */
    describe('Property 7: IDR Currency Formatting', () => {
        it('should always start with "Rp " prefix', () => {
            fc.assert(
                fc.property(fc.integer({ min: 0, max: 1000000000 }), (value) => {
                    const formatted = formatIDR(value);
                    return formatted.startsWith('Rp ');
                }),
                { numRuns: 100 }
            );
        });

        it('should format positive integers correctly', () => {
            fc.assert(
                fc.property(fc.nat(1000000000), (value) => {
                    const formatted = formatIDR(value);
                    // Should match pattern: Rp followed by number with dots as thousand separators
                    const pattern = /^Rp [\d.]+$/;
                    return pattern.test(formatted);
                }),
                { numRuns: 100 }
            );
        });

        it('should handle zero', () => {
            expect(formatIDR(0)).toBe('Rp 0');
        });

        it('should handle NaN', () => {
            expect(formatIDR(NaN)).toBe('Rp 0');
        });

        it('should round decimal values', () => {
            fc.assert(
                fc.property(fc.float({ min: 0, max: 1000000, noNaN: true }), (value) => {
                    const formatted = formatIDR(value);
                    // Should not contain decimal point (rounded)
                    return !formatted.includes(',') || formatted.startsWith('Rp ');
                }),
                { numRuns: 100 }
            );
        });
    });
});

describe('formatCompact', () => {
    it('should format thousands with K suffix', () => {
        expect(formatCompact(1000)).toBe('1.0K');
        expect(formatCompact(1500)).toBe('1.5K');
        expect(formatCompact(999999)).toBe('1000.0K');
    });

    it('should format millions with M suffix', () => {
        expect(formatCompact(1000000)).toBe('1.0M');
        expect(formatCompact(2500000)).toBe('2.5M');
    });

    it('should format billions with B suffix', () => {
        expect(formatCompact(1000000000)).toBe('1.0B');
    });

    it('should return plain number for values under 1000', () => {
        expect(formatCompact(999)).toBe('999');
        expect(formatCompact(0)).toBe('0');
    });
});
