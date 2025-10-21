class Logger {
    isDevelopment = typeof globalThis !== 'undefined' &&
        'process' in globalThis &&
        typeof globalThis.process === 'object' &&
        globalThis.process?.env?.NODE_ENV === 'development';
    formatMessage(entry) {
        return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    }
    log(level, message, data) {
        const entry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            data,
        };
        const formatted = this.formatMessage(entry);
        switch (level) {
            case 'debug':
                if (this.isDevelopment) {
                    console.debug(formatted, data ?? '');
                }
                break;
            case 'info':
                console.log(formatted, data ?? '');
                break;
            case 'warn':
                console.warn(formatted, data ?? '');
                break;
            case 'error':
                console.error(formatted, data ?? '');
                break;
        }
    }
    debug(message, data) {
        this.log('debug', message, data);
    }
    info(message, data) {
        this.log('info', message, data);
    }
    warn(message, data) {
        this.log('warn', message, data);
    }
    error(message, error) {
        this.log('error', message, error);
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map