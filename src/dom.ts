import { guid } from "./util";
import { between } from "./math";

/**
 * 隐藏节点（通过设置 display:none 方式）
 * 注：只有 HTMLElement 才有 style 属性，其他类型的 Node 没有，因此需要断言为 HTMLElement
 * @param {HTMLElement|string} dom - DOM 元素或选择器
 * @returns {void}
 * @example
 * hide('#myElement')
 */
export const hide = (dom: HTMLElement | string): void => {
    const element = findOne(dom);
    if (element) {
        (element as HTMLElement).style.display = "none";
    }
};
/**
 * 显示节点（通过设置 display 为空方式）
 * 注：只有 HTMLElement 才有 style 属性，其他类型的 Node 没有，因此需要断言为 HTMLElement
 * @param {HTMLElement|string} dom - DOM 元素或选择器
 * @returns {void}
 * @example
 * show('#myElement')
 */
export const show = (dom: HTMLElement | string): void => {
    const element = findOne(dom);
    if (element) {
        (element as HTMLElement).style.display = "";
    }
};

/**
 * 移除 DOM 节点
 * @param {HTMLElement|string} dom - DOM 元素或选择器
 * @returns {Node|null} 返回被移除的节点，如果未找到返回 null
 * @example
 * remove('#myElement')
 */
export const remove = (dom: HTMLElement | string): Node | null => {
    let el = findOne(dom);
    return el && el.parentNode && el.parentNode.removeChild(el);
};

const _el_disabled_class_ = "disabled";

/**
 * 禁用元素（禁止交互，设置disabled）
 * @param {String|Node} el
 * @param {String} disabledClass
 */
export const disabled = (el: HTMLElement | string, disabledClass: string = ""): void => {
    return toggleDisabled(el, disabledClass, false);
};

/**
 * 启用元素（允许交互，移除disabled）
 * @param {String|Node} el
 * @param {String} disabledClass
 */
export const enabled = (el: HTMLElement | string, disabledClass: string = ""): void => {
    return toggleDisabled(el, disabledClass, true);
};

/**
 * 禁用启用元素切换
 * @param {String|Node} el
 * @param {String} disabledClass
 * @param {Boolean|Null} forceEnabled 强制启用、禁用，为空表示自动切换
 */
export const toggleDisabled = (el: HTMLElement | string, disabledClass: string = "", forceEnabled: boolean | null = null): void => {
    let element = findOne(el) as HTMLElement;
    let toDisabled = forceEnabled === null ? !element.classList.contains(_el_disabled_class_) : !forceEnabled;
    if (toDisabled) {
        insertStyleSheet(`.${_el_disabled_class_} {pointer-event:none !important;}`, "__element_lock_style__");
    }
    element.classList.toggle(_el_disabled_class_, toDisabled);
    element[toDisabled ? "setAttribute" : "removeAttribute"]("disabled", "disabled");
    element[toDisabled ? "setAttribute" : "removeAttribute"]("data-disabled", "disabled");
    if (disabledClass) {
        element.classList.toggle(disabledClass, toDisabled);
    }
};

export const onHover = (el: HTMLElement | string, onHoverIn: () => void, onHoverOut: () => void): void => {
    el = findOne(el) as HTMLElement;
    let isHovering = false;
    el.addEventListener("mouseenter", () => {
        if (!isHovering) {
            isHovering = true;
            onHoverIn && onHoverIn();
        }
    });
    el.addEventListener("mouseleave", () => {
        if (isHovering) {
            isHovering = false;
            onHoverOut && onHoverOut();
        }
    });
};

/**
 * 绑定元素，禁止交互
 * @param {Node} el
 * @param {Function} payload 处理函数，参数为 reset
 */
export const lockElementInteraction = (el: HTMLElement | string, payload: (reset: () => void) => void): void => {
    disabled(el);
    let reset = () => {
        enabled(el);
    };
    payload(reset);
};
/**
 * 获取当前节点在父节点中的索引号
 * @param {HTMLElement} node - DOM 节点
 * @returns {number} 返回索引号，如果没有父节点返回 -1
 * @example
 * nodeIndex(element) // 2
 */
export const nodeIndex = (node: HTMLElement): number => {
    return node.parentNode ? Array.prototype.indexOf.call(node.parentNode.children, node) : -1;
};

/**
 * 通过选择器查找子节点（强制添加 :scope 来约束必须是子节点）
 * @example
 * findAll('.item', container)
 */
export const findAll = (
    selector: string | Element | Element[],
    parent: Document | DocumentFragment | Element = document,
): Element[] => {
    if (typeof selector === "string") {
        selector = selector.trim();
        if (selector.indexOf(":scope") !== 0) {
            selector = ":scope " + selector;
        }
        return Array.from(parent.querySelectorAll(selector));
    } else if (Array.isArray(selector)) {
        let ns: Element[] = [];
        selector.forEach((sel) => {
            ns.push(...findAll(sel));
        });
        return ns;
    } else if (NodeList.prototype.isPrototypeOf(selector) || HTMLCollection.prototype.isPrototypeOf(selector)) {
        return Array.from(selector as any) as Element[];
    } else if (selector instanceof HTMLElement) {
        return [selector];
    } else {
        return selector as any;
    }
};

/**
 * 通过选择器查找单个节点
 * @example
 * findOne('.item')
 */
export const findOne = (selector: string | Element, parent: Document | DocumentFragment | Element = document): Element | null => {
    return typeof selector === "string" ? parent.querySelector(selector) : selector;
};
/**
 * 获取节点的 XPath
 * @param {HTMLElement|null} el - DOM 元素
 * @returns {string|null} 返回 XPath 字符串，失败返回 null
 * @example
 * getNodeXPath(element) // '/html[1]/body[1]/div[1]'
 */
export const getNodeXPath = (el: HTMLElement | null): string | null => {
    let allNodes = document.getElementsByTagName("*");
    let seg_list: string[] = [];
    for (seg_list = []; el && el.nodeType === 1; el = el.parentNode as HTMLElement) {
        if (el.hasAttribute("id")) {
            let uniqueIdCount = 0;
            for (let n = 0; n < allNodes.length; n++) {
                if (allNodes[n].hasAttribute("id") && allNodes[n].id === el.id) uniqueIdCount++;
                if (uniqueIdCount > 1) break;
            }
            if (uniqueIdCount === 1) {
                seg_list.unshift('id("' + el.getAttribute("id") + '")');
                return seg_list.join("/");
            } else {
                seg_list.unshift(el.localName.toLowerCase() + '[@id="' + el.getAttribute("id") + '"]');
            }
        } else if (el.hasAttribute("class")) {
            seg_list.unshift(el.localName.toLowerCase() + '[@class="' + el.getAttribute("class") + '"]');
        } else {
            let i: number, sib: ChildNode | null;
            for (i = 1, sib = el.previousSibling; sib; sib = sib.previousSibling) {
                if ((sib as any).localName === el.localName) {
                    i++;
                }
            }
            seg_list.unshift(el.localName.toLowerCase() + "[" + i + "]");
        }
    }
    return seg_list.length ? "/" + seg_list.join("/") : null;
};
/**
 * 监听节点树变更
 * @param {HTMLElement} dom - 要监听的 DOM 节点
 * @param {Function} callback - 回调函数
 * @param {boolean} [includeElementChanged=true] - 是否包含表单元素的值变更
 * @returns {void}
 * @example
 * onDomTreeChange(container, () => console.log('changed'))
 */
export const onDomTreeChange = (dom: HTMLElement, callback: () => void, includeElementChanged: boolean = true): void => {
    const PRO_KEY = "ON_DOM_TREE_CHANGE_BIND_" + guid();
    let watchEl = () => {
        findAll(`input:not([${PRO_KEY}]), textarea:not([${PRO_KEY}]), select:not([${PRO_KEY}])`, dom).forEach((el) => {
            el.setAttribute(PRO_KEY, "1");
            el.addEventListener("change", callback);
        });
    };
    mutationEffective(
        dom,
        { attributes: true, subtree: true, childList: true },
        () => {
            includeElementChanged && watchEl();
            callback();
        },
        10,
    );
    includeElementChanged && watchEl();
};

/**
 * 更低占用执行 mutation 监听，支持指定最小间隔时间执行回调
 * @param {HTMLElement} dom - 要监听的 DOM 节点
 * @param {MutationObserverInit} option - MutationObserver 配置选项
 * @param {Function} payload - 回调函数，接收 MutationObserver 实例作为参数
 * @param {number} [minInterval=10] - 执行回调最小间隔时间（毫秒）
 * @returns {void}
 * @example
 * mutationEffective(dom, {attributes: true, childList: true}, (obs) => console.log('changed'))
 */
export const mutationEffective = (dom: HTMLElement, option: MutationObserverInit, payload: (obs: MutationObserver) => void, minInterval: number = 10): void => {
    let last_queue_time = 0;
    let callback_queueing = false;
    let obs = new MutationObserver(() => {
        if (callback_queueing) {
            return;
        }
        let r = minInterval - (Date.now() - last_queue_time);
        if (r > 0) {
            callback_queueing = true;
            setTimeout(() => {
                callback_queueing = false;
                last_queue_time = Date.now();
                payload(obs);
            }, r);
        } else {
            last_queue_time = Date.now();
            payload(obs);
        }
    });
    obs.observe(dom, option);
};

interface Dimension {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * 保持对象尽量在容器内部，优先保证上边、左边显示
 * @param {Object} objDim
 * @param {Number} objDim.left
 * @param {Number} objDim.top
 * @param {Number} objDim.width
 * @param {Number} objDim.height
 * @param {Object} ctnDim
 * @param {Number} ctnDim.left
 * @param {Number} ctnDim.top
 * @param {Number} ctnDim.width
 * @param {Number} ctnDim.height
 * {Array} dimension [dimension.left, dimension.top]
 */
export const keepRectInContainer = (
    objDim: Dimension,
    ctnDim: Dimension = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    },
): { left: number; top: number } => {
    let ret = { left: objDim.left, top: objDim.top };

    //oversize
    if (objDim.width > ctnDim.width || objDim.height > ctnDim.height) {
        return ret;
    }

    //右边超出
    if (objDim.width + objDim.left > ctnDim.width + ctnDim.left) {
        ret.left = objDim.left - (objDim.width + objDim.left - (ctnDim.width + ctnDim.left));
    }

    //底边超出
    if (objDim.height + objDim.top > ctnDim.height + ctnDim.top) {
        ret.top = objDim.top - (objDim.height + objDim.top - (ctnDim.height + ctnDim.top));
    }

    //优先保证左边露出
    if (objDim.left < ctnDim.left) {
        ret.left = ctnDim.left;
    }

    //优先保证上边露出
    if (objDim.top < ctnDim.top) {
        ret.top = ctnDim.top;
    }
    return ret;
};

/**
 * 矩形相交（包括边重叠情况）
 * @param {Dimension} rect1 - 第一个矩形对象
 * @param {Dimension} rect2 - 第二个矩形对象
 * @returns {boolean} 如果两个矩形相交返回 true，否则返回 false
 * @example
 * rectAssoc({left: 0, top: 0, width: 100, height: 100}, {left: 50, top: 50, width: 100, height: 100}) // true
 */
export const rectAssoc = (rect1: Dimension, rect2: Dimension): boolean => {
    if (rect1.left <= rect2.left) {
        return (
            rect1.left + rect1.width >= rect2.left &&
            (between(rect2.top, rect1.top, rect1.top + rect1.height) ||
                between(rect2.top + rect2.height, rect1.top, rect1.top + rect1.height) ||
                (rect2.top >= rect1.top && rect2.height >= rect1.height))
        );
    } else {
        return (
            rect2.left + rect2.width >= rect1.left &&
            (between(rect1.top, rect2.top, rect2.top + rect2.height) ||
                between(rect1.top + rect1.height, rect2.top, rect2.top + rect2.height) ||
                (rect1.top >= rect2.top && rect1.height >= rect2.height))
        );
    }
};

/**
 * 检测元素是否可聚焦
 * @param {HTMLElement} el - DOM 元素
 * @returns {boolean} 如果元素可聚焦返回 true，否则返回 false
 * @example
 * isFocusable(inputElement) // true
 */
export const isFocusable = (el: HTMLElement) => {
    if (!el) return false;
    if (el.tabIndex >= 0) return true;
    if (el instanceof HTMLAnchorElement && el.href) return true;
    if (el instanceof HTMLButtonElement && !el.disabled) return true;
    if (el instanceof HTMLInputElement && !el.disabled) return true;
    if (el instanceof HTMLTextAreaElement && !el.disabled) return true;
    return false;
};

let _c: Record<string, Promise<void>> = {};

/**
 * 挂载 CSS 文件
 * @param {string} file - CSS 文件路径
 * @param {boolean} [forceReload=false] - 是否强制重新挂载，缺省不重复挂载
 * @returns {Promise<void>} 返回 Promise，加载完成后 resolve
 * @example
 * loadCss('/styles/theme.css')
 */
export const loadCss = (file: string, forceReload: boolean = false): Promise<void> => {
    if (!forceReload && file in _c) {
        return _c[file];
    }
    _c[file] = new Promise((resolve, reject) => {
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = file;
        link.onload = () => {
            resolve();
        };
        link.onerror = () => {
            reject();
        };
        document.head.append(link);
    });
    return _c[file];
};

/**
 * 加载 Script 脚本
 * @param {string} src - 脚本地址
 * @param {boolean} [forceReload=false] - 是否强制重新加载，缺省为去重加载
 * @returns {Promise<void>} 返回 Promise，加载完成后 resolve
 * @example
 * loadScript('/scripts/lib.js')
 */
export const loadScript = (src: string, forceReload: boolean = false): Promise<void> => {
    if (!forceReload && src in _c) {
        return _c[src];
    }
    _c[src] = new Promise((resolve, reject) => {
        let script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve();
        };
        script.onerror = () => {
            reject();
        };
        document.head.append(script);
    });
    return _c[src];
};

/**
 * 获取对象宽、高（通过设置 visibility 方式进行获取）
 * @param {HTMLElement} dom - DOM 元素
 * @returns {{width: number, height: number}} 返回元素的宽度和高度
 * @example
 * getDomDimension(element) // {width: 100, height: 50}
 */
export const getDomDimension = (dom: HTMLElement): { width: number; height: number } => {
    let org_visibility = dom.style.visibility;
    let org_display = dom.style.display;
    let width, height;

    dom.style.visibility = "hidden";
    dom.style.display = "block";
    width = dom.clientWidth;
    height = dom.clientHeight;
    dom.style.visibility = org_visibility;
    dom.style.display = org_display;
    return { width, height };
};

/**
 * 在头部插入样式
 * @param {string} styleSheetStr - 样式代码
 * @param {string} [id=''] - 样式 ID，如果提供 ID，将会检测是否已经插入，可以避免重复插入
 * @param {Document} [doc=document] - 文档上下文
 * @returns {HTMLStyleElement|null} 返回创建的 style 元素
 * @example
 * insertStyleSheet('.test { color: red; }', 'my-style')
 */
export const insertStyleSheet = (styleSheetStr: string, id: string = "", doc: Document = document): HTMLStyleElement | null => {
    if (id && doc.querySelector(`#${id}`)) {
        return doc.querySelector(`#${id}`) as HTMLStyleElement;
    }
    let style = doc.createElement("style");
    doc.head.appendChild(style);
    style.innerHTML = styleSheetStr;
    if (id) {
        style.id = id;
    }
    return style;
};

/**
 * 检测矩形是否在指定布局内部
 * @param {Dimension} rect - 要检测的矩形
 * @param {Dimension} layout - 布局矩形
 * @returns {boolean} 如果矩形在布局内部返回 true，否则返回 false
 * @example
 * rectInLayout(rect, layout) // true
 */
export const rectInLayout = (rect: Dimension, layout: Dimension): boolean => {
    return (
        between(rect.top, layout.top, layout.top + layout.height) &&
        between(rect.left, layout.left, layout.left + layout.width) && //左上角
        between(rect.top + rect.height, layout.top, layout.top + layout.height) &&
        between(rect.left + rect.width, layout.left, layout.left + layout.width)
    ); //右下角
};

/**
 * 精度位数转小数表示法
 * @param {number} precision - 精度位数
 * @returns {number} 精度小数表示法，如 0.01
 * @example
 * precisionToStep(2) // 0.01
 */
export const precisionToStep = (precision: number): number => {
    return Math.pow(10, -precision);
};

/**
 * 修复基本 URL（将相对路径转换为绝对 URL）
 * @param {string} url - 要修复的 URL
 * @param {string} baseUrl - 基本 URL
 * @returns {string} 返回修复后的 URL
 * @example
 * fixBaseUrl('/path', 'https://example.com') // 'https://example.com/path'
 */
export const fixBaseUrl = (url: string, baseUrl: string): string => {
    try {
        const fixedUrl = new URL(url, baseUrl);
        return fixedUrl.href;
    } catch {
        return url;
    }
};

/**
 * 创建 HTML 节点
 * @param {string} html - HTML 字符串
 * @param {HTMLElement|null} [parentNode=null] - 父级节点，如果提供则自动添加到父节点
 * @returns {Node|Node[]} 返回创建的节点，单个或多个
 * @example
 * createDomByHtml('<div>Hello</div>')
 */
export const createDomByHtml = (html: string, parentNode: HTMLElement | null = null): Node | Node[] => {
    let tpl = document.createElement("template");
    html = html.trim();
    tpl.innerHTML = html;
    let nodes: Node[] = [];
    if (parentNode) {
        tpl.content.childNodes.forEach((node) => {
            nodes.push(parentNode.appendChild(node));
        });
    } else {
        nodes = Array.from(tpl.content.childNodes);
    }
    return nodes.length === 1 ? nodes[0] : nodes;
};

interface RectObject {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

/**
 * 获取元素的位置（相对于视口）
 * @param {HTMLElement} el - DOM 元素
 * @param {boolean} [autoFixInvisible=false] - 是否自动修正隐藏元素无法测量的 bug
 * @returns {RectObject} 返回元素的位置和尺寸信息
 * @example
 * getBoundingClientRect(element) // {top: 100, left: 50, width: 200, height: 100, ...}
 */
export const getBoundingClientRect = (el: HTMLElement, autoFixInvisible = false): RectObject => {
    if (!el) {
        throw new Error("el is null");
    }
    const rect = el.getBoundingClientRect();

    //自动修正隐藏元素无法测量bug
    if (autoFixInvisible && !rect.height) {
        const originalVisibility = el.style.visibility;
        const originalDisplay = el.style.display;
        el.style.visibility = "hidden";
        el.style.display = "block";
        const overlayRect = getBoundingClientRect(el);
        el.style.visibility = originalVisibility;
        el.style.display = originalDisplay;
        return overlayRect;
    }

    return {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
    };
};

/**
 * 构建 CSS 变量对象
 * @param {Record<string, number|string|undefined>} vars - CSS 变量对象
 * @returns {Record<string, string>} 返回格式化后的 CSS 变量对象
 * @example
 * buildStyleVars({width: '100px', color: 'red', text:'"hello"'}) 
 * 输出 // {'--width': '100px', '--color': 'red', '--text': '"hello"'}
 * 实际样式：style="--width: 100px; --color: red; --text: \"hello\";"
 */
export const buildStyleVars = (vars: Record<string, number | string | undefined>) => {
    let styles = {} as Record<string, string>;
    for (let k in vars) {
        const v = vars[k];
        if (v !== undefined && v !== null) {
            styles[`--${k}`] = `${v}`;
        }
    }
    return styles;
};
