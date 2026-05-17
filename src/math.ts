/** 黄金分割比 0.618 **/
export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2 - 1;

//标准屏幕DPI
export const STAND_DPI = 96;

/**
 * 毫米转换成像素
 * @param {number} dimension - 毫米值
 * @param {number} [dpi=STAND_DPI] - DPI 值，默认为标准 DPI (96)
 * @returns {number} 返回像素值
 * @example
 * mmToPx(25.4) // 96
 */
export const mmToPx = (dimension: number, dpi: number = STAND_DPI): number => {
    let px = (dimension / 25.4) * dpi;
    return px;
};

/**
 * 将 mm 转换为 TWIP（Twentieth of a Point）
 * @param {number} mm - 毫米值
 * @returns {number} 返回 TWIP 值
 * @example
 * mmToTwip(1) // 57
 */
export const mmToTwip = (mm: number): number => Math.round(mm * 56.6929);

/**
 * 将 mm 转换为磅（Point）
 * @param {number} mm - 毫米值
 * @returns {number} 返回磅值
 * @example
 * mmToPt(1) // 2.83
 */
export const mmToPt = (mm: number): number => mm * 2.83464566929;

/**
 * 将磅（Point）转换为 mm
 * @param {number} pt - 磅值
 * @returns {number} 返回毫米值
 * @example
 * ptToMm(2.83) // 1
 */
export const ptToMm = (pt: number): number => pt / 2.83464566929;

/**
 * 像素转毫米
 * @param {number} px - 像素值
 * @param {number} [dpi=STAND_DPI] - DPI 值，默认为标准 DPI (96)
 * @returns {number} 返回毫米值
 * @example
 * pxToMm(96) // 25.4
 */
export const pxToMm = (px: number, dpi: number = STAND_DPI): number => {
    return (25.4 * px) / dpi;
};

/**
 * 限制数值在指定范围内
 * @param {number} num - 要限制的数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 返回限制后的数值
 * @example
 * limit(150, 0, 100) // 100
 */
export const limit = (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max);
}

/**
 * 检测指定值是否在指定区间内
 * @param {Number} val
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} includeEqual 是否包含等于判断
 * @returns {boolean}
 */
export const between = (val: number, min: number, max: number, includeEqual: boolean = true): boolean => {
	return includeEqual ? (val >= min && val <= max) : (val > min && val < max);
};

/**
 * 随机整数
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
export const randomInt = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max + 1 - min)) + min;
};

/**
 * 取整
 * @param {Number} num
 * @param {Number} precision 精度，默认为两位小数
 * @returns {number}
 */
export const round = (num: number, precision: number = 2): number => {
	let multiple = Math.pow(10, precision);
	return Math.round(num * multiple) / multiple;
}

/**
 * 判断一个值是否为数字
 * @param val - 要判断的值
 * @returns 如果是数字返回 true，否则返回 false
 * @example
 * isNumberic(123) // true
 * isNumberic('123.45') // true
 * isNumberic('-123') // true
 * isNumberic('210mm') // false
 */
export const isNumberic = (val: any): boolean => {
    if (typeof val === 'number') {
        return isFinite(val);
    }
    if (typeof val !== 'string') {
        return false;
    }
    // 使用正则表达式严格匹配纯数字字符串，避免 "210mm" 这种被判断为数字
    return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(val);
}

/**
 * 检测数值最大精度
 * @param  {...any} numbers 待检测数值
 * @returns
 */
export const detectedPrecision = (...numbers: number[]): number => {
    let maxPrecision = 0;
    numbers.forEach((num) => {
        if (typeof num === "number" && isNumberic(num)) {
            const decimalPart = num.toString().split(".")[1];
            if (decimalPart) {
                maxPrecision = Math.max(maxPrecision, decimalPart.length);
            }
        }
    });
    return maxPrecision;
};

/**
 * 计算数字位数
 * @param {number} n - 要计算的数字
 * @returns {number} 返回数字的位数
 * @example
 * digitCount(123) // 3
 */
export const digitCount = (n: number): number => {
    n = Math.abs(Number(n)); // 取绝对值，防止负数
    if (n === 0) return 1;
    return Math.floor(Math.log10(n)) + 1;
};