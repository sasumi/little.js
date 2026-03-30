/**
 * 从数组中提取指定列的值
 * @param {T[]} arr - 源数组
 * @param {keyof T} col_name - 列名（对象的键）
 * @returns {any[]} 提取的列值数组
 * @example
 * arrayColumn([{id: 1, name: 'A'}, {id: 2, name: 'B'}], 'name') // ['A', 'B']
 */
export const arrayColumn = <T = any>(arr: T[], col_name: keyof T): any[] => {
    let data: any[] = [];
    for (let i in arr) {
        data.push(arr[i][col_name]);
    }
    return data;
};

/**
 * 查找数组中指定值的索引
 * @param {T[]} arr - 源数组
 * @param {T} val - 要查找的值
 * @returns {string|null} 返回索引字符串，未找到返回 null
 * @example
 * arrayIndex(['a', 'b', 'c'], 'b') // '1'
 */
export const arrayIndex = <T = any>(arr: T[], val: T): string | null => {
    for (let i in arr) {
        if (arr[i] === val) {
            return i;
        }
    }
    return null;
};

/**
 * 数组去重
 * @param {T[]} arr - 源数组
 * @param {function} [payload] - 可选的函数，用于生成唯一键值
 * @returns {T[]} 去重后的数组
 * @example
 * arrayDistinct([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
 * arrayDistinct([{id: 1}, {id: 2}, {id: 1}], item => item.id) // [{id: 1}, {id: 2}]
 */
export const arrayDistinct = <T = any>(arr: T[], payload?: (item: T) => any): T[] => {
    let tmpMap = new Map();
    return arr.filter((item: T) => {
        let unique_key = payload ? payload(item) : item;
        if (!tmpMap.has(unique_key)) {
            tmpMap.set(unique_key, true);
            return true;
        }
    });
};

/**
 * 按指定键对数组进行分组
 * @param {T[]} arr - 源数组
 * @param {keyof T} by_key - 分组依据的键
 * @param {boolean} [limit] - 是否限制每组只保留一个元素
 * @returns {Record<string, T[]> | Record<string, T>} 分组后的对象
 * @example
 * arrayGroup([{type: 'A', val: 1}, {type: 'A', val: 2}], 'type')
 * // { A: [{type: 'A', val: 1}, {type: 'A', val: 2}] }
 */
export const arrayGroup = <T extends Record<string, any>>(arr: T[], by_key: keyof T, limit?: boolean): Record<string, T[]> | Record<string, T> => {
    if (!arr || !arr.length) {
        return arr as any;
    }
    let tmp_rst: Record<string, T[]> = {};
    arr.forEach((item: T) => {
        let k = item[by_key];
        if (!tmp_rst[k]) {
            tmp_rst[k] = [];
        }
        tmp_rst[k].push(item);
    });
    if (!limit) {
        return tmp_rst;
    }
    let rst: Record<string, T> = {};
    for (let i in tmp_rst) {
        rst[i] = tmp_rst[i][0];
    }
    return rst;
};

/**
 * 按照对象的键进行字母顺序排序
 * @param {T} obj - 源对象
 * @returns {T} 键排序后的对象
 * @example
 * arraySortByKey({c: 3, a: 1, b: 2}) // {a: 1, b: 2, c: 3}
 */
export const arraySortByKey = <T extends Record<string, any>>(obj: T): T => {
    return Object.keys(obj)
        .sort()
        .reduce(
            function (result: Record<string, any>, key: string) {
                result[key] = obj[key];
                return result;
            },
            {} as Record<string, any>,
        ) as T;
};

/**
 * 将数组分割成指定大小的块
 * @param {T[]} list - 源数组
 * @param {number} size - 每块的大小
 * @returns {T[][]} 分块后的二维数组
 * @example
 * arrayChunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export const arrayChunk = <T = any>(list: T[], size: number): T[][] => {
    let len = list.length;
    if (size < 1 || !len) {
        return [];
    }
    if (size > len) {
        return [list];
    }
    let res = [];
    let integer = Math.floor(len / size);
    let rest = len % size;
    for (let i = 1; i <= integer; i++) {
        res.push(list.splice(0, size));
    }
    if (rest) {
        res.push(list.splice(0, rest));
    }
    return res;
};

/**
 * 从数组末尾开始移除值为 falsy 的元素，直到遇到第一个 truthy 元素
 * @param {any[]} arr - 要处理的数组
 * @returns {any[]} 处理后的数组
 * @example
 * arrayTrimTail([1, 2, 0, false, null]) // [1, 2]
 */
export const arrayTrimTail = (arr: any[]) => {
    let lastNonZeroIndex = -1;
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i]) {
            lastNonZeroIndex = i;
            break;
        }
    }
    return arr.slice(0, lastNonZeroIndex + 1);
};
