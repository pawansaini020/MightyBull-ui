/**
 * API may send numeric fields as numbers, strings, null, or string "NaN".
 * Never call .toFixed on raw API values in the UI.
 */
export function toFiniteNumber(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const t = value.trim();
        if (t === '' || t === 'NaN') return null;
        const n = Number(t);
        return Number.isFinite(n) ? n : null;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

export function formatScoreCell(score: number | null): string {
    return score == null ? '—' : score.toFixed(2);
}
