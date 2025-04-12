

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
    if (!input || input == undefined || isNaN(input)) {
        return '0';
    }
    if(input < 0.01) {
        return input.toFixed(4);
    }
    return input.toFixed(2);
}

export const getColoredStyle = (value: number, styles: any): string => {
    if(!value || value == undefined || isNaN(value) || value == 0) {
        return styles.neutral;
    }
    if (value > 0) return styles.positive;
    return styles.negative;
}