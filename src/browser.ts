
// 常见DPI
export const COMMON_DPI = 96;

// 当前屏幕DPI
export const SCREEN_DPI = window.devicePixelRatio * COMMON_DPI;

// 是否横屏
export const isLandscape = () => window.innerWidth > window.innerHeight;

// 是否竖屏
export const isPortrait = () => window.innerHeight > window.innerWidth;

/**
 * 进入全屏模式
 * @param {HTMLElement} element - 要全屏显示的元素
 * @returns {Promise<void>} 返回 Promise，全屏操作完成后 resolve
 * @throws {string} 如果浏览器不支持全屏，抛出错误
 * @example
 * enterFullScreen(document.body)
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
 * 退出全屏模式
 * @returns {Promise<void>} 返回 Promise，退出全屏操作完成后 resolve
 * @example
 * exitFullScreen()
 */
export const exitFullScreen = () => {
	return document.exitFullscreen();
}

/**
 * 切换全屏模式（全屏时退出，非全屏时进入）
 * @param {HTMLElement} element - 要全屏显示的元素
 * @returns {Promise<unknown>} 返回 Promise
 * @example
 * toggleFullScreen(document.body)
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
 * @returns {boolean} 如果当前正在全屏模式，返回 true，否则返回 false
 * @example
 * isInFullScreen() // false
 */
export const isInFullScreen = (): boolean => {
	return !!document.fullscreenElement;
}

/**
 * 检测浏览器语言（支持完全匹配和前缀匹配）
 * @param {string[]} supportedLngs - 支持的语言列表
 * @returns {string} 返回匹配的语言或第一个支持的语言
 * @example
 * detectLanguage(['en', 'zh-CN', 'zh']) // '根据浏览器语言返回匹配的语言'
 */
export const detectLanguage = (supportedLngs: string[]): string => {
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

/**
 * 检测是否为 Firefox 浏览器
 * @returns {boolean} 如果是 Firefox 浏览器，返回 true，否则返回 false
 * @example
 * isFirefox() // false
 */
export const isFirefox = (): boolean => {
	return navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
};