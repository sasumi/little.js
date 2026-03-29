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
 * 将 HTML 转换为纯文本（移除所有标签和样式）
 * @param {string} html - HTML 字符串
 * @returns {string} 返回纯文本
 * @example
 * html2Text('<p>Hello <b>World</b></p>') // 'Hello World'
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
 * 将纯文本转换为 HTML（转义特殊字符并处理换行）
 * @param {string} text - 纯文本字符串
 * @returns {string} 返回 HTML 字符串
 * @example
 * text2Html('Hello\nWorld') // 'Hello<br/>World'
 */
export const text2Html = (text: string): string => {
    return escapeHtml(text, 0, false).replace(/\n/g, "<br/>");
};

/**
 * CSS 选择器转义（处理特殊字符）
 * @param {string} str - 要转义的字符串
 * @returns {string} 转义后的字符串
 * @example
 * cssSelectorEscape('my#id') // 'my\\#id'
 */
export const cssSelectorEscape = (str: string): string => {
    return window.CSS && CSS.escape ? CSS.escape(str) : str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
};

/**
 * HTML 实体转字符串
 * @param {string} entity - HTML 实体字符串（如 &#72;&#101;&#108;&#108;&#111;）
 * @returns {string} 返回解码后的字符串
 * @example
 * entityToString('&#72;&#101;') // 'He'
 */
export const entityToString = (entity: string): string => {
    let entities = entity.split(";");
    entities.pop();
    return entities.map((item: string) => String.fromCharCode(item[2] === "x" ? parseInt(item.slice(3), 16) : parseInt(item.slice(2)))).join("");
};

let _helper_div: HTMLDivElement | undefined;
/**
 * 解码 HTML 实体（包括 script 和 HTML 标签过滤）
 * @param {string} str - 包含 HTML 实体的字符串
 * @returns {string} 返回解码后的字符串
 * @example
 * decodeHTMLEntities('&lt;div&gt;') // '<div>'
 */
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
 * @param {Record<string, any>} maps - 键值对对象
 * @returns {string} 返回 HTML 字符串
 * @example
 * buildHtmlHidden({name: 'John', age: 30}) // '<input type="hidden" name="name" value="John"/>...'
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
 * 转义 HTML（将特殊字符转换为 HTML 实体）
 * @param {string} str - 要转义的字符串
 * @param {number} [tabSize=2] - Tab 宽度，如果设置为 0，表示去除 tab
 * @param {boolean} [allowLineBreaker=true] - 是否允许换行
 * @returns {string} 返回转义后的 HTML
 * @example
 * escapeHtml('<div>Hello</div>') // '&lt;div&gt;Hello&lt;/div&gt;'
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
 * 反转义 HTML（将 HTML 实体转换为字符）
 * @param {string} html - 包含 HTML 实体的字符串
 * @returns {string} 返回反转义后的字符串
 * @example
 * unescapeHtml('&lt;div&gt;') // '<div>'
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

export const markdown2Html = (md: string): string => {
    if (!md) {
        return "";
    }

    let html = md;

    // 转义 HTML（基础防 XSS）
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // ===== 标题 =====
    html = html.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
    html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
    html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // ===== 粗体 / 斜体 =====
    html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

    // ===== 行内代码 =====
    html = html.replace(/`(.*?)`/gim, "<code>$1</code>");

    // ===== 图片 =====
    html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />');

    // ===== 链接 =====
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');

    // ===== 表格（简单版）=====
    html = html.replace(/((\|.*\|\n)+)/g, (match) => {
        const rows = match.trim().split("\n");

        // 至少3行才认为是表格（header + 分隔 + body）
        if (rows.length < 2) return match;

        let table = "<table>";

        rows.forEach((row, i) => {
            const cells = row.split("|").slice(1, -1);

            // 分隔行（---）跳过
            if (/^\s*-+\s*$/.test(cells[0])) return;

            const tag = i === 0 ? "th" : "td";

            table += "<tr>";
            cells.forEach((cell) => {
                table += `<${tag}>${cell.trim()}</${tag}>`;
            });
            table += "</tr>";
        });

        table += "</table>";
        return table;
    });

    // ===== 无序列表 =====
    html = html.replace(/^\s*-\s+(.*)/gim, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/gims, "<ul>$1</ul>");

    // ===== 换行 =====
    html = html.replace(/\n/g, "<br />");

    return html.trim();
};

/**
 * 转义 HTML 到属性值（处理属性中的特殊字符）
 * @param {string} s - 要转义的字符串
 * @param {string} [preserveCR=''] - 是否保留回车符
 * @returns {string} 返回转义后的字符串
 * @example
 * escapeAttr('Hello "World"') // 'Hello &quot;World&quot;'
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

/**
 * 字符串转换为 HTML 实体
 * @param {string} str - 要转换的字符串
 * @param {number} [radix] - 进制，为 16 时使用十六进制
 * @returns {string} 返回 HTML 实体字符串
 * @example
 * stringToEntity('AB', 16) // '&#x41;&#x42;'
 */
export const stringToEntity = (str: string, radix?: number): string => {
    let arr = str.split("");
    radix = radix || 0;
    return arr.map((item: string) => `&#${radix ? "x" + item.charCodeAt(0).toString(16) : item.charCodeAt(0)};`).join("");
};

/**
 * 高亮文本（将关键字用指定模板包裹）
 * @param {string} text - 原始文本
 * @param {string} kw - 关键字
 * @param {string} [replaceTpl='<span class="matched">%s</span>'] - 替换模板，%s 为占位符
 * @returns {string} 返回高亮后的 HTML
 * @example
 * highlightText('Hello World', 'World') // 'Hello <span class="matched">World</span>'
 */
export const highlightText = (text: string, kw: string, replaceTpl: string = '<span class="matched">%s</span>'): string => {
    if (!kw) {
        return text;
    }
    return text.replace(new RegExp(regQuote(kw), "ig"), (match: string) => {
        return replaceTpl.replace("%s", match);
    });
};
