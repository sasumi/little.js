import { blobToBase64 } from "./base64";

/**
 * 通过 Image 获取base64数据
 * @param img
 * @returns {string|string|*|string|null}
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
 * 通过ImageSrc获取base64（网络请求模式）
 * @param src
 * @returns {Promise<unknown>}
 */
export const srcToBase64 = (src: string): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", src, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
            if (this.status === 200) {
                let blob = this.response;
                blobToBase64(blob)
                    .then((base64) => {
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
