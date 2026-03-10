import { regQuote } from "./string";

/**
 * 块元素
 * 用大写定义，方便直接匹配 node.tagName
 * @type {string[]}
 */
export const BLOCK_TAGS = [
    "ADDRESS",
    "ARTICLE",
    "ASIDE",
    "BLOCKQUOTE",
    "CANVAS",
    "DD",
    "DIV",
    "DL",
    "DT",
    "FIELDSET",
    "FIGCAPTION",
    "FIGURE",
    "FOOTER",
    "FORM",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "HEADER",
    "HR",
    "LI",
    "MAIN",
    "NAV",
    "NOSCRIPT",
    "OL",
    "P",
    "PRE",
    "SECTION",
    "TABLE",
    "TFOOT",
    "UL",
    "VIDEO",
];

/**
 * 非自关闭标签
 * https://www.w3schools.com/html/html_blocks.asp
 * @type {*[]}
 */
export const PAIR_TAGS = [
    "A",
    "ABBR",
    "ACRONYM",
    "B",
    "BDO",
    "BIG",
    "BUTTON",
    "CITE",
    "CODE",
    "DFN",
    "EM",
    "I",
    "KBD",
    "LABEL",
    "MAP",
    "OBJECT",
    "OUTPUT",
    "Q",
    "S",
    "SAMP",
    "SCRIPT",
    "SELECT",
    "SMALL",
    "SPAN",
    "STRONG",
    "SUB",
    "SUP",
    "TEXTAREA",
    "TIME",
    "TT",
    "U",
    "VAR",
].concat(...BLOCK_TAGS);

/**
 * 自关闭标签
 * @type {string[]}
 */
export const SELF_CLOSING_TAGS = ["AREA", "BASE", "BR", "COL", "EMBED", "HR", "IMG", "INPUT", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];

/**
 * 非内容可清理标签
 * @type {string[]}
 */
export const REMOVABLE_TAGS = ["STYLE", "COMMENT", "SELECT", "OPTION", "SCRIPT", "TITLE", "HEAD", "BUTTON", "META", "LINK", "PARAM", "SOURCE"];

/**
 * Convert html to plain text
 * @param {String} html
 * @returns {string}
 */
export const html2Text = (html: string): string => {
    //remove removable tags
    REMOVABLE_TAGS.forEach((tag) => {
        html = html.replace(new RegExp(tag, "ig"), "");
    });

    //remove text line break
    html = html.replace(/[\r|\n]/g, "");

    //convert block tags to line break
    html = html.replace(/<(\w+)([^>]*)>/g, function (_ms: string, tag: string, _tail: string) {
        if (BLOCK_TAGS.includes(tag.toUpperCase())) {
            return "\n";
        }
        return "";
    });

    //remove tag's postfix
    html = html.replace(/<\/(\w+)([^>]*)>/g, function (_ms: string, _tag: string, _tail: string) {
        return "";
    });

    //remove other tags, likes <img>, input, etc...
    html = html.replace(/<[^>]+>/g, "");

    //convert entity by names
    let entityNamesMap: [RegExp, string][] = [
        [/&nbsp;/gi, " "],
        [/&lt;/gi, "<"],
        [/&gt;/gi, ">"],
        [/&quot;/gi, '"'],
        [/&apos;/gi, "'"],
    ];
    entityNamesMap.forEach(([matchReg, replacement]) => {
        html = html.replace(matchReg, replacement);
    });

    //convert entity dec code
    html = html.replace(/&#(\d+);/, function (_ms: string, dec: string) {
        return String.fromCharCode(parseInt(dec));
    });

    //replace last &amp;
    html = html.replace(/&amp;/gi, "&");

    //trim head & tail space
    html = html.trim();

    return html;
};

/**
 * CSS 选择器转义
 * @param {String} str
 * @returns {String}
 */
export const cssSelectorEscape = (str: string): string => {
    return window.CSS && CSS.escape ? CSS.escape(str) : str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
};

/**
 * HTML实例转字符串
 * @param {string} entity
 * @returns {string}
 */
export const entityToString = (entity: string): string => {
    let entities = entity.split(";");
    entities.pop();
    return entities.map((item: string) => String.fromCharCode(item[2] === "x" ? parseInt(item.slice(3), 16) : parseInt(item.slice(2)))).join("");
};

let _helper_div: HTMLDivElement | undefined;
export const decodeHTMLEntities = (str: string): string => {
    if (!_helper_div) {
        _helper_div = document.createElement("div");
    }
    // strip script/html tags
    str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "");
    str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, "");
    _helper_div.innerHTML = str;
    str = _helper_div.textContent || "";
    _helper_div.textContent = "";
    return str;
};

/**
 * 构建 HTML Input:hidden 标签
 * @param {Object} maps {key:value}
 * @return {string}
 */
export const buildHtmlHidden = (maps: Record<string, any>): string => {
    let html = "";
    for (let key in maps) {
        let val = maps[key] === null ? "" : maps[key];
        html += `<input type="hidden" name="${escapeAttr(key)}" value="${escapeAttr(val)}"/>`;
    }
    return html;
};

/**
 * 转义HTML
 * @param {string} str
 * @param {Number} tabSize tab宽度，如果设置为0，表示去除tab
 * @param {Boolean} allowLineBreaker 是否允许换行
 * @returns {string}
 */
export const escapeHtml = (str: string, tabSize: number = 2, allowLineBreaker: boolean = true): string => {
    let s = String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    if (allowLineBreaker) {
        s = s.replace(/[\r\n]/g, "<br/>");
    }
    if (tabSize) {
        s = s.replace(/\t/g, "&nbsp;".repeat(tabSize));
    }
    s = s.replace(/\s/g, "&nbsp;");
    return s;
};

/**
 * 反转义HTML
 * @param {String} html
 * @returns {string}
 */
export const unescapeHtml = (html: string): string => {
    return String(html)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/<br.*>/, "\n");
};

/**
 * 转义HTML到属性值
 * @param {String} s
 * @param preserveCR
 * @returns {string}
 */
export const escapeAttr = (s: string, preserveCR: string = ""): string => {
    preserveCR = preserveCR ? "&#13;" : "\n";
    return (
        ("" + s) /* Forces the conversion to string. */
            .replace(/&/g, "&amp;") /* This MUST be the 1st replacement. */
            .replace(/'/g, "&apos;") /* The 4 other predefined entities, required. */
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            /*
		You may add other replacements here for HTML only
		(but it's not necessary).
		Or for XML, only if the named entities are defined in its DTD.
		*/
            .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
            .replace(/[\r\n]/g, preserveCR)
    );
};

export const stringToEntity = (str: string, radix?: number): string => {
    let arr = str.split("");
    radix = radix || 0;
    return arr.map((item: string) => `&#${radix ? "x" + item.charCodeAt(0).toString(16) : item.charCodeAt(0)};`).join("");
};

/**
 * 高亮文本
 * @param {String} text 文本
 * @param {String} kw 关键字
 * @param {String} replaceTpl 替换模板
 * @returns {void|string|*}
 */
export const highlightText = (text: string, kw: string, replaceTpl: string = '<span class="matched">%s</span>'): string => {
    if (!kw) {
        return text;
    }
    return text.replace(new RegExp(regQuote(kw), "ig"), (match: string) => {
        return replaceTpl.replace("%s", match);
    });
};
