// Shared TypeScript type utilities

/**
 * Make all properties of T nullable
 */
export type Nullable<T> = {
	[P in keyof T]: T[P] | null;
};

/**
 * Make all properties of T optional and nullable
 */
export type Optional<T> = {
	[P in keyof T]?: T[P] | null;
};

/**
 * Deep partial - makes all properties optional recursively
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
