import { guid } from "./util";
import { between } from "./math";

/**
 * 隐藏节点（通过设置display:none方式）
 * @param {Node|String} dom
 */
export const hide = (dom: HTMLElement | string): void => {
    findOne(dom).style.display = "none";
};
/**
 * 显示节点（通过设置display为空方式）
 * @param {HTMLElement} dom
 * @param dom
 */
export const show = (dom: HTMLElement | string): void => {
    findOne(dom).style.display = "";
};

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
 * 获取当前节点在父结点中的索引号
 * @param node
 * @return {number}
 */
export const nodeIndex = (node: HTMLElement): number => {
    return node.parentNode ? Array.prototype.indexOf.call(node.parentNode.children, node) : -1;
};

/**
 * 通过选择器查找子节点（强制添加 :scope来约束必须是子节点）
 * @param {String} selector
 * @param {Node} parent
 * @return {Node[]}
 */
export const findAll = (
    selector: string | HTMLElement | HTMLElement[] | NodeList | HTMLCollection,
    parent: Document | HTMLElement = document,
): HTMLElement[] => {
    if (typeof selector === "string") {
        selector = selector.trim();
        if (selector.indexOf(":scope") !== 0) {
            selector = ":scope " + selector;
        }
        return Array.from(parent.querySelectorAll(selector));
    } else if (Array.isArray(selector)) {
        let ns: HTMLElement[] = [];
        selector.forEach((sel) => {
            ns.push(...findAll(sel));
        });
        return ns;
    } else if (NodeList.prototype.isPrototypeOf(selector) || HTMLCollection.prototype.isPrototypeOf(selector)) {
        return Array.from(selector as any) as HTMLElement[];
    } else if (selector instanceof HTMLElement) {
        return [selector];
    } else {
        return selector as any;
    }
};

/**
 * @param {String|Object} selector 选择器，如果是Object，则直接返回Object
 * @param {Node} parent
 * @return {Node}
 */
export const findOne = (selector: string | HTMLElement, parent: Document | HTMLElement = document): HTMLElement => {
    return typeof selector === "string" ? (parent.querySelector(selector) as HTMLElement) : selector;
};
/**
 * get node xpath
 * @param el
 * @return {String}
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
 * @param {Node} dom
 * @param {Function} callback
 * @param {Boolean} includeElementChanged 是否包含表单元素的值变更
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
 * 更低占用执行mutation监听，支持指定最小间隔时间执行回调
 * @param {Node} dom
 * @param {Object} option
 * @param {Boolean} option.attributes
 * @param {Boolean} option.subtree
 * @param {Boolean} option.childList
 * @param {Function} payload
 * @param {Number} minInterval 执行回调最小间隔时间（毫秒）
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
 * @param {Object} rect1
 * @param {Object} rect2
 * @returns {boolean}
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
 * 挂载css文件
 * @param {String} file
 * @param {Boolean} forceReload 是否强制重新挂载，缺省不重复挂载
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
 * 加载script脚本
 * @param {String} src 脚本地址
 * @param {Boolean} forceReload 是否强制重新加载，缺省为去重加载
 * @return {Promise}
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
 * 获取对象宽、高
 * 通过设置 visibility 方式进行获取
 * @param {HTMLElement} dom
 * @return {{width: number, height: number}}
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
 * @param {String} styleSheetStr 样式代码
 * @param {String} id 样式ID，如果提供ID，将会检测是否已经插入，可以避免重复插入
 * @param {Document} doc 文档上下文
 * @return {HTMLStyleElement}
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
 * @param rect
 * @param layout
 * @returns {*}
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
 * 创建HTML节点
 * @param {String} html
 * @param {HTMLElement|null} parentNode 父级节点
 * @returns {HTMLElement|HTMLElement[]}
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
 * 获取元素的位置(相对于视口)
 * @param {HTMLElement} el
 * @returns
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
