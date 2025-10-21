/**
 * Utility for conditionally joining classNames
 * Simple implementation without external dependencies
 */
export function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
//# sourceMappingURL=cn.js.map