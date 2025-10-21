/**
 * Format a date to a readable string
 */
export function formatDate(date) {
    let d;
    if (typeof date === 'string') {
        // Check if it's YYYY-MM-DD format
        const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
            // Parse as local date to avoid timezone issues
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const day = parseInt(match[3], 10);
            d = new Date(year, month - 1, day);
        }
        else {
            d = new Date(date);
        }
    }
    else {
        d = date;
    }
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
/**
 * Format a date to a relative time string
 */
export function formatRelativeTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0)
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
}
/**
 * Format a number with commas
 */
export function formatNumber(num) {
    return num.toLocaleString('en-US');
}
/**
 * Truncate a string to a maximum length
 */
export function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - 3) + '...';
}
//# sourceMappingURL=format.js.map