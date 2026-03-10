/** 黄金分割比 0.618 **/
export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2 - 1;

//标准屏幕DPI
export const STAND_DPI = 96;

/**
 * 毫米转换成像素
 * @param {float} dimension
 * @param {int} dpi
 * @returns int
 */
export const mmToPx = (dimension: number, dpi: number = STAND_DPI): number => {
    let px = (dimension / 25.4) * dpi;
    return px;
};

/**
 * 将 mm 转换为 TWIP
 * @param {*} mm
 * @returns
 */
export const mmToTwip = (mm: number): number => Math.round(mm * 56.6929);

/**
 * 将 mm 转换为 磅
 * @param {Number} mm
 * @returns {Number}
 */
export const mmToPt = (mm: number): number => mm * 2.83464566929;

/**
 * 将 pt 转换为 mm
 * @param {Number} pt
 * @returns {Number}
 */
export const ptToMm = (pt: number): number => pt / 2.83464566929;

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
 * 检测数值最大精度
 * @param  {...any} numbers 待检测数值
 * @returns
 */
export const detectedPrecision = (...numbers: number[]): number => {
    let maxPrecision = 0;
    numbers.forEach((num) => {
        if (typeof num === "number" && !isNaN(num)) {
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
 * @param {Number} n
 * @returns
 */
export const digitCount = (n: number) => {
    n = Math.abs(Number(n)); // 取绝对值，防止负数
    if (n === 0) return 1;
    return Math.floor(Math.log10(n)) + 1;
};