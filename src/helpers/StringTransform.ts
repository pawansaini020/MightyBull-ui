

export function getTwoCapitalChars(input: string): string {
    if (!input) {
        return '';
    }
    const words = input.split(' ');
    const firstChar = words[0] ? words[0][0] : '';
    const secondChar = words.length > 1 ? words[1][0] : words[0][1] || '';
    return `${firstChar.toUpperCase()}${secondChar ? secondChar.toUpperCase():''}`;
}