import { MIME_FORM, MIME_JSON, MIME_MULTIPART } from "./mime";

/**
 * 将 URL 查询字符串转换为对象
 * @param {string} query - 查询字符串
 * @returns {Record<string, string>} 返回键值对对象
 * @example
 * queryToObj('name=John&age=30') // {name: 'John', age: '30'}
 */
export const queryToObj = (query: string): Record<string, string> => {
    const obj: Record<string, string> = {};
    query
        .replace(/^\?/, "")
        .split("&")
        .forEach((pair) => {
            const [key, value] = pair.split("=");
            if (key) {
                obj[decodeURIComponent(key)] = decodeURIComponent(value || "");
            }
        });
    return obj;
};

/**
 * 替换 URL 中的查询参数
 * @param {string} url - 原始 URL
 * @param {Record<string, any>} newQuery - 新的查询参数对象
 * @returns {string} 返回更新后的 URL
 * @example
 * queryReplace('http://example.com?a=1', {b: 2}) // 'http://example.com?a=1&b=2'
 */
export const queryReplace = (url: string, newQuery: Record<string, any>): string => {
    const [baseUrl, queryString] = url.split("?");
    const currentQuery = queryString ? queryToObj(queryString) : {};
    const mergedQuery = { ...currentQuery, ...newQuery };
    const newQueryString = objToQuery(mergedQuery);
    return `${baseUrl}?${newQueryString}`;
};

/**
 * 将对象转换为 URL 查询字符串
 * @param {Record<string, any>} data - 数据对象
 * @returns {string} 返回查询字符串
 * @example
 * objToQuery({name: 'John', age: 30}) // 'name=John&age=30'
 */
export const objToQuery = (data: Record<string, any>): string => {
    if (typeof data === "undefined" || typeof data !== "object") {
        return data;
    }
    let query = [];
    for (let param in data) {
        if (data.hasOwnProperty(param)) {
            if (data[param] === null) {
                continue; //null数据不提交
            }
            if (typeof data[param] === "object" && data[param].length) {
                data[param].forEach((item: any) => {
                    query.push(encodeURI(param + "=" + item));
                });
            } else if (typeof data[param] === "object") {
                //todo 不处理子级object、空数组情况
            } else {
                query.push(encodeURI(param + "=" + data[param]));
            }
        }
    }
    return query.join("&");
};

/**
 * 可中止的 Fetch 请求
 */
export interface AbortablePromise<T> extends Promise<T> {
    abort: () => void;
}

/**
 * 拓展原生 Fetch API 实现可中止的请求，支持超时设置
 * @param {string} url - 请求 URL
 * @param {RequestInit} [fetchOption={}] - fetch请求选项，包括 method、headers、body 等
 * @param {number} [timeout=0] - 超时时间，单位毫秒，0 表示不设置超时
 * @returns {AbortablePromise<any>} 返回可中止的 Promise 对象
 * @example
 * const req = abortableFetch('/api/data');
 * req.abort('cancled'); // 中止请求
 */
export const abortableFetch = (url: string, fetchOption: RequestInit = {}, timeout = 0): AbortablePromise<any> => {
    const controller = new AbortController();

    let timeoutId: number | null = null;
    if (timeout) {
        timeoutId = setTimeout(() => controller.abort(), timeout);
    }

    const clearTimer = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    const addAbortMethod = (promise: Promise<any>): AbortablePromise<any> => {
        const abortablePromise = promise as AbortablePromise<any>;

        // 保存原始方法
        const originalThen = abortablePromise.then.bind(abortablePromise);
        const originalCatch = abortablePromise.catch.bind(abortablePromise);
        const originalFinally = abortablePromise.finally.bind(abortablePromise);

        // 重写方法，确保返回的 Promise 也具有 abort 方法
        abortablePromise.then = function (onfulfilled, onrejected) {
            return addAbortMethod(originalThen(onfulfilled, onrejected));
        };

        abortablePromise.catch = function (onrejected) {
            return addAbortMethod(originalCatch(onrejected));
        };

        abortablePromise.finally = function (onfinally) {
            return addAbortMethod(originalFinally(onfinally));
        };

        // 添加 abort 方法
        abortablePromise.abort = (reason?: string) => {
            clearTimer();
            controller.abort(reason || "Request aborted by user");
        };

        return abortablePromise;
    };

    const fetchPromise = fetch(url, {
        ...fetchOption,
        signal: controller.signal,
    })
        .then((res) => {
            clearTimer();
            return res;
        })
        .catch((err) => {
            clearTimer();
            throw err;
        });

    return addAbortMethod(fetchPromise);
};

// 扩展 RequestInit，添加 timeout 和其他自定义属性，timeout 用于设置请求超时时间，delay 用于模拟慢速请求，其他自定义属性可以直接添加到 headers 中
interface RequestOption extends RequestInit {
    timeout?: number;
    delay?: number;
    [key: string]: any;
}

const appendHeader = (key: string, value: any, headers: Headers): void => {
    if (value == null) return;
    // 将驼峰命名转换为 HTTP 头格式 (例如: ContentType -> content-type)
    const headerName = key
        .replace(/([A-Z])/g, "-$1")
        .replace(/^-/, "")
        .toLowerCase();
    headers.set(headerName, String(value));
};

// 判断属性是否为 RequestInit 的标准属性
const isRequestInitProp = (key: string): boolean => {
    return [
        "method",
        "headers",
        "body",
        "mode",
        "credentials",
        "cache",
        "redirect",
        "referrer",
        "referrerPolicy",
        "integrity",
        "keepalive",
        "signal",
        "window",
    ].includes(key);
};

/**
 * 发送 HTTP 请求
 * @param {string} url - 请求 URL
 * @param {BodyInit|null} [data=null] - 请求数据,可以是字符串、FormData、URLSearchParams、Blob、ArrayBuffer 等，如果是对象会根据 ContentType 自动转换（例如 application/json 会自动 JSON.stringify）
 * @param {RequestOption} option - 请求选项
 * @param {number} [option.timeout] - 请求超时时间（毫秒）
 * @param {number} [option.delay] - 延迟响应时间（毫秒），用于模拟慢速请求
 * @returns {AbortablePromise<Response>} 返回可中止的 Promise
 * @example
 * request('/api/data', null, {method: 'GET'})
 * request('/api/data', null, {method: 'GET', delay: 2000}) // 延迟 2 秒响应
 */
export const request = (url: string, data: BodyInit | null = null, option: RequestOption): AbortablePromise<Response> => {
    let { timeout, delay, ...fetchOption } = option;
    fetchOption = fetchOption || {};
    fetchOption.method = fetchOption.method || "GET";

    const IS_GET = fetchOption.method.toUpperCase() === "GET";

    const headers = new Headers(fetchOption.headers || {});

    //如果 key 不是RequestInit的属性，则添加到 headers 中
    for (let key in fetchOption) {
        if (!isRequestInitProp(key)) {
            appendHeader(key, fetchOption[key], headers);
        }
    }

    if (IS_GET && data) {
        url = queryReplace(url, typeof data === "string" ? queryToObj(data) : data);
        data = null;
    }

    return abortableFetch(
        url,
        {
            headers,
            ...{
                body: !IS_GET ? fixData(data, headers.get("content-type") || undefined) : undefined,
            },
            ...fetchOption,
        },
        timeout,
    ).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 如果设置了延迟，则延迟返回响应
        if (delay && delay > 0) {
            return new Promise<Response>((resolve) => {
                setTimeout(() => resolve(response), delay);
            });
        }
        return response;
    }) as AbortablePromise<Response>;
};

/**
 * 检测值是否为 BodyInit 可接受的类型
 * @param {any} value - 要检测的值
 * @returns {boolean} 如果是 BodyInit 可接受的类型返回 true，否则返回 false
 */
export const isBodyInit = (value: any): value is BodyInit => {
    return (
        typeof value === "string" ||
        value instanceof FormData ||
        value instanceof URLSearchParams ||
        value instanceof Blob ||
        value instanceof ArrayBuffer ||
        ArrayBuffer.isView(value)
    );
};

const fixData = (data: any, contentType?: string) => {
    if (isBodyInit(data)) {
        return data;
    }
    if (typeof data !== "object") {
        return data;
    }
    switch (contentType?.toLowerCase()) {
        case MIME_JSON:
            return JSON.stringify(data);
        case MIME_FORM:
        case MIME_MULTIPART:
        default:
            return objToQuery(data);
    }
};

/**
 * 发送 GET 请求并获取 JSON 响应
 * @param {string} url - 请求 URL
 * @param {any} [data=null] - 请求数据
 * @param {RequestOption} [option={}] - 请求选项
 * @returns {Promise<any>} 返回解析后的 JSON 数据
 * @example
 * getJson('/api/users').then(data => console.log(data))
 */
export const getJson = (url: string, data: any = null, option: RequestOption = {}) => {
    return request(url, data, { ...option, ContentType: MIME_JSON, Accept: MIME_JSON }).then((response) => response.json());
};

/**
 * 发送 POST 请求并获取 JSON 响应
 * @param {string} url - 请求 URL
 * @param {any} [data=null] - 请求数据
 * @param {RequestOption} [option={}] - 请求选项
 * @returns {Promise<any>} 返回解析后的 JSON 数据
 * @example
 * postJson('/api/users', {name: 'John'}).then(data => console.log(data))
 */
export const postJson = (url: string, data: any = null, option: RequestOption = {}) => {
    return request(url, data, { ...option, method: "POST", ContentType: MIME_JSON, Accept: MIME_JSON }).then((response) => response.json());
};

/**
 * 上传文件
 * @param {string} url - 请求 URL
 * @param {Record<string, File>} fileMap - 文件对象映射
 * @param {any} [data=null] - 额外的表单数据
 * @param {RequestOption} [option={}] - 请求选项
 * @returns {Promise<any>} 返回解析后的 JSON 数据
 * @example
 * postFiles('/api/upload', {avatar: fileObject})
 */
export const postFiles = (url: string, fileMap: Record<string, File>, data: any = null, option: RequestOption = {}) => {
    const formData = new FormData();
    Object.keys(fileMap).forEach((key) => {
        formData.append(key, fileMap[key], fileMap[key].name);
    });
    if (data) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                formData.append(key, data[key]);
            }
        }
    }
    return request(url, formData, { ...option, method: "POST" }).then((response) => response.json());
};
