import { SCREEN_DPI } from "./browser";
import { isNumberic } from "./math";

/**
 * 首字母大写
 * @param str - 输入字符串
 * @returns 首字母大写的字符串
 * @example
 * capitalize('hello') // 'Hello'
 */
export function capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 解析带单位的值，返回数值和单位
 */
export const parseUnit = (value: string | number, defaultUnit = ""): { val: number; unit: string } | null => {
    if (typeof value === "number") {
        return { val: value, unit: defaultUnit };
    }
    if (isNumberic(value)) {
        return { val: parseFloat(value), unit: defaultUnit };
    }
    const regex = /^(-?[\d.]+)([a-z%]+)$/i;
    const match = value.trim().match(regex);
    if (!match) {
        throw new Error("unit parse fail:" + value);
    }
    return { val: parseFloat(match[1]), unit: match[2].toLowerCase() };
};

/**
 * 单位转换工具，支持px、mm、cm、in等常见单位之间的转换
 * @returns {Number} 转换后的数值（以目标单位为准）
 */
export const unitConvert = (
    value: string | number,
    toUnit: string,
    extOption: {
        dpi?: number;
        fontSize?: number | null;
        lineHeight?: number | null;
    } = {},
): number => {
    const match = parseUnit(value);
    if (!match) {
        throw new Error(`Invalid value: ${value}`);
    }
    const num = match.val;
    const fromUnit = match.unit;
    if (!isNumberic(num)) {
        throw new Error(`Invalid number in value: ${value}`);
    }
    const dpi = extOption.dpi || SCREEN_DPI;
    
    // 如果单位相同，直接返回
    if (fromUnit === toUnit) {
        return num;
    }

    // 单位到mm的转换系数
    const toMmFactors: Record<string, number> = {
        mm: 1,
        cm: 10,
        in: 25.4,
        px: 25.4 / dpi,
        pt: 25.4 / 72, // 1pt = 1/72 inch
        pc: 25.4 / 6, // 1pc = 1/6 inch
    };

    // mm到目标单位的转换系数
    const fromMmFactors: Record<string, number> = {
        mm: 1,
        cm: 1 / 10,
        in: 1 / 25.4,
        px: dpi / 25.4,
        pt: 72 / 25.4,
        pc: 6 / 25.4,
    };

    if (!toMmFactors[fromUnit]) {
        throw new Error(`Unsupported source unit: ${fromUnit}`);
    }
    if (!fromMmFactors[toUnit]) {
        throw new Error(`Unsupported target unit: ${toUnit}`);
    }

    // 先转换为mm，再转换为目标单位
    const valueInMm = num * toMmFactors[fromUnit];
    return valueInMm * fromMmFactors[toUnit];
};

/**
 * 将字符串转换为浮点数
 * @param {*} str - 要转换的字符串
 * @param {number} [defaultVal=0] - 转换失败时的默认值
 * @returns {number} 返回转换后的浮点数，如果转换失败则返回默认值
 */
export const floatVal = (str: any, defaultVal: number = 0): number => {
    if (!isNumberic(str)) {
        return defaultVal;
    }
    return parseFloat(str);
};

/**
 * 反转义字符串
 * @param str
 * @returns {string}
 * @description:
 *       discuss at: https://locutus.io/php/stripslashes/
 *      original by: Kevin van Zonneveld (https://kvz.io)
 *      improved by: Ates Goral (https://magnetiq.com)
 *      improved by: marrtins
 *      improved by: rezna
 *         fixed by: Mick@el
 *      bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
 *      bugfixed by: Brett Zamir (https://brett-zamir.me)
 *         input by: Rick Waldron
 *         input by: Brant Messenger (https://www.brantmessenger.com/)
 * reimplemented by: Brett Zamir (https://brett-zamir.me)
 *        example 1: stripslashes('Kevin\'s code')
 *        returns 1: "Kevin's code"
 *        example 2: stripslashes('Kevin\\\'s code')
 *        returns 2: "Kevin\'s code"
 */
export const stripSlashes = (str: string): string => {
    return (str + "").replace(/\\(.?)/g, function (_s: string, n1: string) {
        switch (n1) {
            case "\\":
                return "\\";
            case "0":
                return "\u0000";
            case "":
                return "";
            default:
                return n1;
        }
    });
};

/**
 * 中英文字符串截取（中文按照 2 个字符长度计算）
 * @param {string} str - 要截取的字符串
 * @param {number} len - 截取长度
 * @param {string} [eclipse_text='...'] - 省略符，默认为 '...'
 * @returns {string} 返回截取后的字符串
 * @example
 * cutString('中文English', 6, '...') // '中文E...'
 */
export const cutString = (str: string, len: number, eclipse_text: string = "..."): string => {
    let r = /[^\x00-\xff]/g;
    if (str.replace(r, "mm").length <= len) {
        return str;
    }
    let m = Math.floor(len / 2);
    for (let i = m; i < str.length; i++) {
        if (str.substr(0, i).replace(r, "mm").length >= len) {
            return str.substr(0, i) + eclipse_text;
        }
    }
    return str;
};

/**
 * 混合ES6模板字符串
 * @example extract("hello ${user_name}", {user_name:"Jack"});
 * @param {String} es_template 模板
 * @param {Object} params 数据对象
 * @return {String}
 */
export const extract = (es_template: string, params: Record<string, any>): string => {
    const names = Object.keys(params);
    const values = Object.values(params);
    return new Function(...names, `return \`${es_template}\`;`)(...values);
};

/**
 * 驼峰命名转换
 * @param str - 输入字符串
 * @returns 驼峰命名的字符串
 * @example
 * camelCase('hello-world') // 'helloWorld'
 * camelCase('hello_world') // 'helloWorld'
 */
export function camelCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

/**
 * 短横线命名转换
 * @param str - 输入字符串
 * @returns 短横线命名的字符串
 * @example
 * kebabCase('helloWorld') // 'hello-world'
 * kebabCase('HelloWorld') // 'hello-world'
 */
export function kebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase();
}

/**
 * 截断字符串
 * @param str - 输入字符串
 * @param length - 最大长度
 * @param suffix - 后缀，默认为 '...'
 * @returns 截断后的字符串
 * @example
 * truncate('hello world', 5) // 'hello...'
 */
export function truncate(str: string, length: number, suffix: string = "..."): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + suffix;
}

/**
 * 正则表达式转义（将特殊字符转义）
 * @param {string} str - 要转义的字符串
 * @returns {string} 返回转义后的字符串
 * @example
 * regQuote('a.b') // 'a\\.b'
 */
export const regQuote = (str: string): string => {
    return (str + "").replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
};

/**
 * UTF-8 解码
 * @param {string} srcStr - 要解码的字符串
 * @returns {string} 返回解码后的字符串
 * @example
 * utf8Decode(encodedStr) // 'decoded string'
 */
export const utf8Decode = (srcStr: string): string => {
    let t = "";
    let n = 0;
    let r = 0,
        c2 = 0,
        c3 = 0;
    while (n < srcStr.length) {
        r = srcStr.charCodeAt(n);
        if (r < 128) {
            t += String.fromCharCode(r);
            n++;
        } else if (r > 191 && r < 224) {
            c2 = srcStr.charCodeAt(n + 1);
            t += String.fromCharCode(((r & 31) << 6) | (c2 & 63));
            n += 2;
        } else {
            c2 = srcStr.charCodeAt(n + 1);
            c3 = srcStr.charCodeAt(n + 2);
            t += String.fromCharCode(((r & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            n += 3;
        }
    }
    return t;
};

/**
 * UTF-8 编码
 * @param {string} srcStr - 要编码的字符串
 * @returns {string} 返回编码后的字符串
 * @example
 * utf8Encode('string') // 'encoded string'
 */
export const utf8Encode = (srcStr: string): string => {
    srcStr = srcStr.replace(/\r\n/g, "n");
    let t = "";
    for (let n = 0; n < srcStr.length; n++) {
        let r = srcStr.charCodeAt(n);
        if (r < 128) {
            t += String.fromCharCode(r);
        } else if (r > 127 && r < 2048) {
            t += String.fromCharCode((r >> 6) | 192);
            t += String.fromCharCode((r & 63) | 128);
        } else {
            t += String.fromCharCode((r >> 12) | 224);
            t += String.fromCharCode(((r >> 6) & 63) | 128);
            t += String.fromCharCode((r & 63) | 128);
        }
    }
    return t;
};

/**
 * 获取 UTF-8 字符串长度（一个中文字按照 3 个字数计算）
 * @param {string} str - 要计算的字符串
 * @returns {number} 返回字符串长度
 * @example
 * getUTF8StrLen('中文') // 6
 */
export const getUTF8StrLen = (str: string): number => {
    let realLength = 0;
    let len = str.length;
    let charCode = -1;
    for (let i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {
            realLength += 1;
        } else {
            realLength += 3;
        }
    }
    return realLength;
};
const DEFAULT_RANDOM_STRING = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890";

/**
 * 产生随机字符串
 * @param {Number} length
 * @param {String} sourceStr
 * @returns {String}
 */
export const randomString = (length = 6, sourceStr = DEFAULT_RANDOM_STRING) => {
    let codes = "";
    for (let i = 0; i < length; i++) {
        let rnd = Math.round(Math.random() * (sourceStr.length - 1));
        codes += sourceStr.substring(rnd, rnd + 1);
    }
    return codes;
};

/**
 * 产生随机单词
 * @param {Number} count 单词数量
 * @param {Number} letterMax 每个单词最大字符数量
 * @return {String[]} 单词列表
 */
export const randomWords = (count = 1, letterMax = 8) => {
    let words = [];
    const possible = "bcdfghjklmnpqrstvwxyz";
    const possibleVowels = "aeiou";

    while (count-- > 0) {
        let word = "";
        for (let i = 0; i < letterMax; i = i + 3) {
            word += possible[Math.floor(Math.random() * possible.length)];
            word += possibleVowels[Math.floor(Math.random() * possibleVowels.length)];
            word += possible[Math.floor(Math.random() * possible.length)];
        }
        words.push(word);
    }
    return words;
};

/**
 * 字符串转成首字母大写（Pascal Case）
 * @param {string} str - 要转换的字符串
 * @param {boolean} [capitalize_first=false] - 是否将第一个单词首字母大写
 * @returns {string} 返回转换后的字符串
 * @example
 * strToPascalCase('hello-world', true) // 'HelloWorld'
 */
export const strToPascalCase = (str: string, capitalize_first: boolean = false): string => {
    let words: string[] = [];
    str.replace(/[-_\s+]/g, " ")
        .split(" ")
        .forEach((word, idx) => {
            words.push(idx === 0 && !capitalize_first ? word : capitalize(word));
        });
    return words.join("");
};

// trim 方向常量
export const TRIM_BOTH = 0;
export const TRIM_LEFT = 1;
export const TRIM_RIGHT = 2;

/**
 * 去除字符串首尾指定字符或空白
 * @param {string} str - 源字符串
 * @param {string} [chars=''] - 指定字符，默认为空白
 * @param {number} [dir=TRIM_BOTH] - 方向（TRIM_BOTH/TRIM_LEFT/TRIM_RIGHT）
 * @returns {string} 返回去除后的字符串
 * @example
 * trim('__hello__', '_') // 'hello'
 */
export const trim = (str: string, chars: string = "", dir: number = TRIM_BOTH): string => {
    if (chars.length) {
        let regLeft = new RegExp("^[" + regQuote(chars) + "]+"),
            regRight = new RegExp("[" + regQuote(chars) + "]+$");
        return dir === TRIM_LEFT ? str.replace(regLeft, "") : dir === TRIM_RIGHT ? str.replace(regRight, "") : str.replace(regLeft, "").replace(regRight, "");
    } else {
        return dir === TRIM_BOTH ? str.trim() : dir === TRIM_LEFT ? str.trimStart() : str.trimEnd();
    }
};

/**
 * 将字符串分割成指定长度的数组
 * @param {string} str - 要分割的字符串
 * @param {number} size - 每段的长度
 * @returns {string[]} 返回分割后的数组
 * @example
 * strChunk('abcdef', 2) // ['ab', 'cd', 'ef']
 */
export const strChunk = (str: string, size: number): string[] => {
    let ret: string[] = [];
    for (let i = 0; i < str.length; i += size) {
        ret.push(str.slice(i, i + size));
    }
    return ret;
};

/**
 * 判断字符串是否包含中文字符
 * @param {string} str - 要判断的字符串
 * @returns {boolean} 返回是否包含中文字符
 */
export const isChinese = (str: string): boolean => {
    return /[\u4e00-\u9fa5]/.test(str);
};
