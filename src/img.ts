import { blobToBase64 } from "./base64";
import { isFirefox } from "./browser";
import { urlB64DataCache } from "./file";
import { floatVal, isNumberic } from "./string";

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
			const { width, height } = svgGetBBox(svg);
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
 * 兼容方式获取svg的BBox，避免Firefox获取svg尺寸时，额外考虑了父容器的zoom
 * @param {SVGSVGElement} svg
 * @returns {DOMRect}
 * @returns {DOMRect.width} 单位px
 * @returns {DOMRect.height} 单位px
 * @see https://stackoverflow.com/questions/60814803/getboundingbox-of-svg-element-in-firefox
 */
const svgGetBBox = (svg: SVGSVGElement) => {
	if (!isFirefox()) {
		return svg.getBBox();
	}

	// 克隆并插入到隐藏容器
	const clone = svg.cloneNode(true) as SVGSVGElement;
	const div = document.createElement("div");
	div.style.cssText = "position:fixed;left:-9999px;top:-9999px;visibility:hidden;";
	div.appendChild(clone as unknown as Node);
	document.body.appendChild(div);
	const bbox = clone.getBBox();
	document.body.removeChild(div);
	return bbox;
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
