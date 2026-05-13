const _EventBus = new EventTarget();
const STR_SYM_MAP = new Map<string, symbol>();
const SYM_STR_MAP = new Map<symbol, string>();

let id = 0;
const PREFIX = `__MINUTOOL_SYM_EVENT__`;
function symbolToString(sym: symbol): string {
    if (!SYM_STR_MAP.has(sym)) {
        const key = `${PREFIX}${++id}`;
        SYM_STR_MAP.set(sym, key);
        STR_SYM_MAP.set(key, sym);
    }
    return SYM_STR_MAP.get(sym)!;
}

export const onEvents = (events: (string | symbol)[], handler: EventListenerOrEventListenerObject) => {
	const offFunctions = events.map((event) => onEvent(event, handler));
	return () => offFunctions.forEach((off) => off());
}

/**
 * 订阅事件，event 可以是字符串或 Symbol，handler 是事件处理函数
 * @param {string | symbol} event 事件名称
 * @param {Function} handler 事件处理函数
 * @return {Function} 返回一个取消订阅的函数
 */
export const onEvent = (event: string | symbol, handler: EventListenerOrEventListenerObject) => {
    _EventBus.addEventListener(typeof event === "symbol" ? symbolToString(event) : event, handler);
    return () => offEvent(event, handler);
};

/**
 * 取消订阅事件，event 可以是字符串或 Symbol，handler 是事件处理函数
 * @param {string | symbol} event 事件名称
 * @param {Function} handler 事件处理函数
 */
export const offEvent = (event: string | symbol, handler: EventListenerOrEventListenerObject) => {
    _EventBus.removeEventListener(typeof event === "symbol" ? symbolToString(event) : event, handler);
};

/**
 * 发布事件，event 可以是字符串或 Symbol，detail 是事件详情
 * @param {string | symbol} event 事件名称
 * @param {any} detail 事件详情
 */
export const dispatchEvent = (event: string | symbol, detail: any = null) => {
    _EventBus.dispatchEvent(new CustomEvent(typeof event === "symbol" ? symbolToString(event) : event, { detail }));
};
