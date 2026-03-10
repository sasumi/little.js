import { randomString } from "./string";

let _guid = 0;
export const guid = (prefix = "") => {
    return "guid_" + (prefix || randomString(6)) + ++_guid;
};

/**
 * 节流
 * 规定在一个单位时间内，只能触发一次函数。如果这个函数单位时间内触发多次函数，只有一次生效。
 * @param {Function} fn
 * @param {Number} intervalMiSec
 * @return {(function(): void)|*}
 */
export const throttle = (fn: Function, intervalMiSec: number): Function => {
    let context: any, args: any;
    let previous = 0;
    return function (this: any) {
        let now = +new Date();
        context = this;
        args = arguments;
        if (now - previous > intervalMiSec) {
            fn.apply(context, args as any);
            previous = now;
        }
    };
};

/**
 * 更有效果的节流函数
 * 区别：如果函数执行间隔还没到期，放入下一个时间周期执行，如果已经有下一周期未执行，当前触发作废。
 * 这种效果在 **Change 类型函数场景中更有效果，可以确保最后一次变更能够有效执行
 * @param {Function} fn
 * @param {Number} intervalMiSec
 */
export const throttleEffect = (fn: Function, intervalMiSec: number): Function => {
    let context: any, args: any;
    let lastExecuteTime = 0;
    let queuing = false;
    return function (this: any) {
        if (queuing) {
            return;
        }
        let now = +new Date();
        context = this;
        args = arguments;
        let remaining = intervalMiSec - (now - lastExecuteTime);
        if (remaining <= 0) {
            fn.apply(context, args as any);
            lastExecuteTime = now;
        } else {
            queuing = true;
            setTimeout(() => {
                fn.apply(context, args as any);
                queuing = false;
                lastExecuteTime = now;
            }, remaining);
        }
    };
};

/**
 * 在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。
 * @param {Function} fn
 * @param {Number} intervalMiSec
 * @return {(function(): void)|*}
 */
export const debounce = (fn: Function, intervalMiSec: number): Function => {
    let timeout: any;
    return function (this: any) {
        let context = this;
        let args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            fn.apply(context, args);
        }, intervalMiSec);
    };
};
/**
 * 检测对象是否为Promise对象
 * @param {*} obj
 * @returns {boolean}
 */
export const isPromise = (obj: any): boolean => {
    return obj && typeof obj === "object" && obj.then && typeof obj.then === "function";
};

export const isJson = (json: string): boolean => {
    let is_json = false;
    try {
        JSON.parse(json);
        is_json = true;
    } catch (error) {}
    return is_json;
};

/**
 * 检测目标是否为 Object
 * @param {*} item
 * @returns {boolean}
 */
export const isObject = (item: any): boolean => {
    return item && typeof item === "object" && !Array.isArray(item);
};

export const isFunction = (value: any): boolean => {
    return value ? Object.prototype.toString.call(value) === "[object Function]" || "function" === typeof value || value instanceof Function : false;
};

/**
 * 检测是否为 URL（不包含 blob: data: file: 等协议）
 */
export const isUrl = (str: string) => {
    if (typeof str !== "string" || str.trim() === "") return false;
    // 常见的可作为资源的 URL/路径：http(s)://, //, blob:, data:, file:, 以及以 / 或 ./ ../ 开头的相对路径
    return /^(https?:\/\/|\/\/|\/|\.\.?\/*)/i.test(str);
};

/**
 * 判断字符串是否符合 JSON 标准
 * @param {String} json
 * @returns {boolean}
 */
export const isJSON = (json: string): boolean => {
	let is_json = false;
	try{
		JSON.parse(json);
		is_json = true;
	}catch(error){
	}
	return is_json;
}

/**
 * 打印调用堆栈
 */
export const printStack = () => {
    let stack = new Error().stack;
    console.log(stack);
};