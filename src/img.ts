import { blobToBase64 } from "./base64";
import { urlB64DataCache } from "./file";
import { isNumberic } from "./math";
import { floatVal, parseUnit, unitConvert } from "./string";

/**
 * 通过 Image 元素获取 Base64 数据
 * @param {HTMLImageElement} img - 图片元素
 * @returns {string|null} 返回 Base64 Data URL，失败返回 null
 * @example
 * imgToBase64(imageElement) // 'data:image/png;base64,...'
 */
export const imgToBase64 = (img: HTMLImageElement): string | null => {
    if (!img.src) {
        return null;
    }
    if (img.src.indexOf("data:") === 0) {
        return img.src;
    }
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    return canvas.toDataURL("image/png");
};

/**
 * svg 对象转换为图片数据
 */
export const svgToSrc = (svg: SVGSVGElement) => {
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    return URL.createObjectURL(svgBlob);
};

/**
 * svg 对象转换为图片对象
 * @returns
 */
export const svgToImg = (svg: SVGSVGElement): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const src = svgToSrc(svg);
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };

        img.onerror = (err) => {
            reject(new Error("Failed to load SVG into Image:" + err));
        };

        img.src = src;
    });
};

/**
 * svg 对象转换为图片数据
 * @param {SVGSVGElement} svg
 * @param {String} format
 * @param {number} quality
 * @returns
 */
export const svgToImgData = (svg: SVGSVGElement, format: string | null = null, quality: number | null = null): Promise<string> => {
    format = format || "image/png";
    return new Promise((resolve, reject) => {
        const normalizedQuality = isNumberic(quality) ? floatVal(quality) : 1;
        svgToImg(svg).then((img) => {
            const [width, height] = svgGetDimenssion(svg);
            const canvas = document.createElement("canvas");
            canvas.width = width * normalizedQuality;
            canvas.height = height * normalizedQuality;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, width * normalizedQuality, height * normalizedQuality);
            URL.revokeObjectURL((img as HTMLImageElement).src);
            resolve(canvas.toDataURL(format));
        }, reject);
    });
};

/**
 * 获取 SVG 的尺寸（像素单位）
 * 优先级：width/height 属性 > viewBox > getBoundingClientRect
 * @param {SVGSVGElement} svg - SVG 元素
 * @returns {DOMRect} 返回包含像素单位的尺寸对象
 * @returns {number} DOMRect.width - 宽度（像素）
 * @returns {number} DOMRect.height - 高度（像素）
 * @example
 * // <svg width="210mm" height="297mm" viewBox="0 0 210 297">
 * svgGetBBox(svg) // { x: 0, y: 0, width: 793.7, height: 1122.5 } (像素)
 */
export const svgGetDimenssion = (svg: SVGSVGElement): [number, number] => {
    let width: number | null = null;
    let height: number | null = null;

    // 优先从 width/height 属性获取（可能带单位）
    const widthAttr = svg.getAttribute('width');
    const heightAttr = svg.getAttribute('height');

    if (widthAttr && heightAttr) {
        try {
            const widthParsed = parseUnit(widthAttr, 'px');
            const heightParsed = parseUnit(heightAttr, 'px');
            if (widthParsed && heightParsed) {
                width = unitConvert(widthParsed.val + widthParsed.unit, 'px');
                height = unitConvert(heightParsed.val + heightParsed.unit, 'px');
            }
        } catch (e) {
            // 解析失败，继续尝试其他方法
        }
    }

    // 如果没有 width/height 属性，尝试从 viewBox 获取
    if (width === null || height === null) {
        const viewBox = svg.viewBox.baseVal;
        if (viewBox && viewBox.width && viewBox.height) {
            // viewBox 值默认为用户单位，通常对应像素
            width = viewBox.width;
            height = viewBox.height;
        }
    }

    // 后备方案：使用 getBoundingClientRect（已经是像素）
    if (width === null || height === null) {
        const rect = svg.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
    }

    return [width, height];
};

/**
 * 通过图片 URL 获取 Base64（网络请求模式）
 * @param {string} url - 图片 URL
 * @param {boolean} [cache=false] - 是否缓存结果
 * @returns {Promise<unknown>} 返回 Base64 Data URL 的 Promise
 * @example
 * srcToBase64('https://example.com/image.png').then(base64 => console.log(base64))
 */
export const srcToBase64 = (url: string, cache: boolean = false): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        if (cache) {
            const cached = urlB64DataCache(url);
            if (cached) {
                return resolve(cached);
            }
        }
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
            if (this.status === 200) {
                let blob = this.response;
                blobToBase64(blob)
                    .then((base64) => {
                        if (cache) {
                            urlB64DataCache(url, base64 as string);
                        }
                        resolve(base64);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        };
        xhr.onerror = function () {
            reject("Error:" + this.statusText);
        };
        xhr.onabort = function () {
            reject("Request abort");
        };
        xhr.send();
    });
};
