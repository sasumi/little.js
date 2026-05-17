/**
 * 深拷贝对象
 * @param obj - 要拷贝的对象
 * @returns 拷贝后的新对象
 * @example
 * deepClone({ a: 1, b: { c: 2 } })
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
    if (obj instanceof Object) {
        const clonedObj = {} as T;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
}

/**
 * 判断对象是否为空
 * @param obj - 要判断的对象
 * @returns 是否为空对象
 * @example
 * isEmptyObject({}) // true
 * isEmptyObject({ a: 1 }) // false
 */
export function isEmptyObject(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

/**
 * 根据映射关系替换对象的键
 * @param obj - 要替换键的对象
 * @param mapping - 键映射关系，例如 { oldKey: 'newKey' }
 * @returns 替换键后的新对象
 * @example
 * objectKeyReplace({ a: 1, b: 2 }, { a: 'x' }) // { x: 1, b: 2 }
 */
export const objectKeyReplace = (obj: Record<string, any>, mapping: Record<string, string>): Record<string, any> => {
    let ret: Record<string, any> = {};
    for (let key in obj) {
        if (mapping[key] !== undefined) {
            ret[mapping[key]] = obj[key];
        } else {
            ret[key] = obj[key];
        }
    }
    return ret;
};

/**
 * 获取对象的键值对数组，代替 Object.entries，如果key是数字，则转换为数字类型
 * @param obj - 要获取键值对的对象
 * @returns 键值对数组
 * @example
 * objectEntries({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 */
export const objectEntries = <T extends Record<string | number | symbol, any>>(obj: T) => {
    return Object.entries(obj).map(([key, value]) => {
        const parsedKey = /^\d+$/.test(key) ? Number(key) : key;
        return [parsedKey, value] as [keyof T, T[keyof T]];
    });
}

/**
 * 从键值对数组创建对象，代替 Object.fromEntries，如果key是数字字符串，则转换为数字类型
 * @param entries - 键值对数组
 * @returns 创建的对象
 * @example
 * objectFromEntries([['a', 1], ['b', 2]]) // { a: 1, b: 2 }
 */
export const objectFromEntries = <T extends Record<string | number | symbol, any>>(entries: Iterable<readonly [string | number, T[keyof T]]>) => {
    const obj: Record<string | number, T[keyof T]> = {};
    for (const [key, value] of entries) {
        const parsedKey = typeof key === "string" && /^\d+$/.test(key) ? Number(key) : key;
        obj[parsedKey] = value;
    }
    return obj as T;
}

/**
 * 交换对象中的键值对
 * @param obj - 要交换键值对的对象
 * @returns 交换后的对象
 * @example
 * objectSwitchKV({a: 1, b: 2}) // {1: 'a', 2: 'b'}
 */
export const objectSwitchKV = (obj: object) => {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
};

/**
 * 获取对象指定路径的值
 * @param obj - 对象
 * @param path - 路径，例如 'a.b.c'
 * @param defaultValue - 默认值
 * @returns 获取到的值或默认值
 * @example
 * get({ a: { b: { c: 1 } } }, 'a.b.c') // 1
 * get({ a: { b: 1 } }, 'a.b.c', 0) // 0
 */
export function objectGet<T = any>(obj: any, path: string, defaultValue?: T): T {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue as T;
        }
        result = result[key];
    }

    return result !== undefined ? result : (defaultValue as T);
}

/**
 * 设置对象指定路径的值
 * @param obj - 对象
 * @param path - 路径，例如 'a.b.c'
 * @param value - 要设置的值
 * @example
 * set({}, 'a.b.c', 1) // { a: { b: { c: 1 } } }
 */
export function objectSet(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    let current = obj;

    for (const key of keys) {
        if (!(key in current) || typeof current[key] !== "object") {
            current[key] = {};
        }
        current = current[key];
    }

    current[lastKey] = value;
}

/**
 * 合并对象
 * @param target - 目标对象
 * @param sources - 源对象
 * @returns 合并后的对象
 * @example
 * merge({ a: 1 }, { b: 2 }, { c: 3 }) // { a: 1, b: 2, c: 3 }
 */
export function objectMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
    for (const source of sources) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                const sourceValue = source[key];
                const targetValue = (target as any)[key];

                if (
                    sourceValue &&
                    typeof sourceValue === "object" &&
                    !Array.isArray(sourceValue) &&
                    targetValue &&
                    typeof targetValue === "object" &&
                    !Array.isArray(targetValue)
                ) {
                    (target as any)[key] = objectMerge(targetValue, sourceValue);
                } else {
                    (target as any)[key] = sourceValue;
                }
            }
        }
    }
    return target;
}

/**
 * 清理对象中的 null 值
 * @param {any} obj - 要清理的对象
 * @param {boolean} [recursive=false] - 是否递归清理子对象
 * @returns {any} 返回清理后的对象
 * @example
 * cleanNull({a: 1, b: null, c: {d: null}}, true) // {a: 1, c: {}}
 */
export const cleanNull = (obj: any, recursive = false) => {
    for (const key in obj) {
        if (obj[key] === null) {
            delete obj[key];
        } else if (recursive && typeof obj[key] === "object") {
            cleanNull(obj[key], true);
        }
    }
    return obj;
};
