
/**
 * 设置 Cookie
 * @param {string} name - Cookie 名称
 * @param {string} value - Cookie 值
 * @param {number} days - 有效天数，0 表示会话 Cookie
 * @param {string} [path='/'] - Cookie 路径，默认为根路径
 * @param {string} [domain] - Cookie 域名
 * @returns {void}
 * @example
 * setCookie('username', 'john', 7)
 * setCookie('username', 'john', 7, '/', '.example.com')
 */
export const setCookie = (name: string, value: string, days: number, path: string = '/', domain?: string): void => {
	let expires = "";
	if(days){
		let date = new Date();
		date.setTime(Date.now() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	let cookieString = name + "=" + (value || "") + expires + "; path=" + path;
	if (domain) {
		cookieString += "; domain=" + domain;
	}
	document.cookie = cookieString;
}

/**
 * 获取 Cookie
 * @param {string} name - Cookie 名称
 * @returns {string|null} 返回 Cookie 值，未找到返回 null
 * @example
 * getCookie('username') // 'john'
 */
export const getCookie = (name: string): string | null => {
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for(let i = 0; i < ca.length; i++){
		let c = ca[i];
		while(c.charAt(0) === ' ') c = c.substring(1, c.length);
		if(c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

/**
 * 删除 Cookie
 * @param {string} name - Cookie 名称
 * @param {string} [path='/'] - Cookie 路径，必须与设置时的路径一致
 * @param {string} [domain] - Cookie 域名，必须与设置时的域名一致
 * @returns {void}
 * @example
 * deleteCookie('username')
 * deleteCookie('username', '/', '.example.com')
 */
export const deleteCookie = (name: string, path: string = '/', domain?: string): void => {
	let cookieString = name + '=; Path=' + path + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	if (domain) {
		cookieString += ' Domain=' + domain + ';';
	}
	document.cookie = cookieString;
}