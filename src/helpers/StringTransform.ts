// Constants
const DEFAULT_VALUE = "NA";

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

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
    return input.toFixed(2);
}

export const getColoredStyle = (value: number, styles: any): string => {
    if(!value || value == undefined || isNaN(value) || value == 0) {
        return styles.neutral;
    }
    if (value > 0) return styles.positive;
    return styles.negative;
}

// Helper functions
export const formateString = (value: any, suffix: string = "") : string => {
    return value ? `${value}${suffix}` : DEFAULT_VALUE;
};

export const formatDate = (date: string | Date | null | undefined, format: string = 'DD-MM-YYYY'): string => {
    if (!date) return 'NA';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'NA';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return format
        .replace('DD', day)
        .replace('MMMM', monthNames[parseInt(month) - 1])
        .replace('MM', month)
        .replace('YYYY', String(year))
        .replace('HH', hours)
        .replace('mm', minutes);
};