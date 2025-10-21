declare class Logger {
    private isDevelopment;
    private formatMessage;
    private log;
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, error?: unknown): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map