import { isURL } from "./util";

/**
 * 过滤字符串为合法文件名
 * 替换 Windows/Unix 不允许的字符为下划线
 * 包括：\ / : * ? " < > | 以及控制字符
 * @param {string} name
 * @returns {string}
 */
export const sanitizeFileName = (name: string): string => {
    return name
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/[\0-\x1F]/g, "_") // 单独替换控制字符
        .replace(/\s+/g, " ") // 替换多个空格为一个空格
        .replace(/^\.+/, "") // 去除开头的点
        .replace(/\.+$/, "") // 去除结尾的点
        .trim();
};

export const blobToDataURL = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(blob);
    });

/**
 * 将文件转换为 Base64 data URL
 * 支持 File/Blob 对象，或字符串 URL（http(s)/相对/blob:）
 * @param {File|Blob|String} file
 * @returns {Promise<String|null>} 返回 data URL 字符串，失败返回 null
 */
export const fileToBase64DataURL = async (file: File | Blob | string) => {
    if (!file) {
        return null;
    }

    // 已经是 data URL
    if (typeof file === "string" && file.startsWith("data:")) {
        return file;
    }

    try {
        // 字符串 URL（http(s)/相对/blob:）
        if (typeof file === "string" && isURL(file)) {
            // fetch -> blob -> dataURL
            const resp = await fetch(file);
            if (!resp.ok) {
                throw new Error(`Fetch failed: ${resp.status}`);
            }
            const blob = await resp.blob();
            return await blobToDataURL(blob);
        }

        // File 或 Blob
        if (file instanceof Blob) {
            return await blobToDataURL(file);
        }

        // 不能处理的类型，返回 null
        return null;
    } catch (err) {
        console.warn("file2Base64DataURL failed:", err);
        return null;
    }
};

/**
 * 下载文件
 * @param {String} uri
 * @param {String} fileName
 */
export const downloadFile = (uri: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = uri;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
