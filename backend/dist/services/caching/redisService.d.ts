declare class RedisService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
    delete(key: string): Promise<void>;
    flush(): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
}
export declare const redisService: RedisService;
export default redisService;
//# sourceMappingURL=redisService.d.ts.map