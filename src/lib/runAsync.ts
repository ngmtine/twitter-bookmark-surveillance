/**
 * 非同期ラッパー
 */
export const runAsync = async <T>(fn: () => T): Promise<T> => {
    return Promise.resolve(fn());
};
