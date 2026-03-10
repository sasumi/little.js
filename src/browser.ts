
/**
 * 进入全屏模式
 * @param {HTMLElement} element
 */
export const enterFullScreen = (element: any): Promise<void> => {
	if (element.requestFullscreen) {
		return element.requestFullscreen();
	}
	if (element.webkitRequestFullScreen) {
		return element.webkitRequestFullScreen();
	}
	if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	}
	if (element.msRequestFullScreen) {
		element.msRequestFullScreen();
	}
	throw "Browser no allow full screen";
}

/**
 * 退出全屏
 * @returns {Promise<void>}
 */
export const exitFullScreen = () => {
	return document.exitFullscreen();
}

/**
 * 切换全屏
 * @param element
 * @returns {Promise<unknown>}
 */
export const toggleFullScreen = (element: any): Promise<unknown> => {
	return new Promise((resolve, reject) => {
		if (!isInFullScreen()) {
			enterFullScreen(element).then(resolve).catch(reject);
		} else {
			exitFullScreen().then(resolve).catch(reject);
		}
	})
}
/**
 * 检测是否正在全屏
 * @returns {boolean}
 */
export const isInFullScreen = () => {
	return !!document.fullscreenElement;
}

export const detectLanguage = (supportedLngs: string[]) => {
    const browserLang = navigator.language || (navigator as any).userLanguage;

    // 尝试完全匹配
    if (supportedLngs.includes(browserLang)) {
        return browserLang;
    }

    // 尝试匹配语言代码的前缀 (例如 zh-CN -> zh)
    const langPrefix = browserLang.split("-")[0];
    const match = supportedLngs.find((lng) => lng.startsWith(langPrefix));
    if (match) {
        return match;
    }
    return supportedLngs[0];
};