

export function getTwoCapitalChars(input: string): string {
    if (!input) {
        return '';
    }
    const words = input.split(' ');
    const firstChar = words[0] ? words[0][0] : '';
    const secondChar = words.length > 1 ? words[1][0] : words[0][1] || '';
    return `${firstChar.toUpperCase()}${secondChar ? secondChar.toUpperCase():''}`;
}

export function formatNumber(input: number): string {
    if (!input) {
        return '0';
    } else if (isNaN(input)) {
        return '0';
    }
    if(input < 0.01) {
        return input.toFixed(4);
    }
    return input.toFixed(2);
}