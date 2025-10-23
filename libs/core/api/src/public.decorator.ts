import { SetMetadata } from "@nestjs/common";

/**
 * Public route decorator
 * Marks a route as public, bypassing authentication guards
 */
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
