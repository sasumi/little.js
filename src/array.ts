/**
 * array_column
 * @param arr
 * @param col_name
 * @returns {Array}
 */
export const arrayColumn = <T = any>(arr: T[], col_name: keyof T): any[] => {
	let data: any[] = [];
	for(let i in arr){
		data.push(arr[i][col_name]);
	}
	return data;
};

/**
 * @param arr
 * @param val
 * @return {string|null}
 */
export const arrayIndex = <T = any>(arr: T[], val: T): string | null => {
	for(let i in arr){
		if(arr[i] === val){
			return i;
		}
	}
	return null;
};


/**
 * 数组去重
 * @param {Array} arr
 * @returns {*}
 */
export const arrayDistinct = <T = any>(arr: T[]): T[] => {
	let tmpMap = new Map();
	return arr.filter((item: T) => {
		if(!tmpMap.has(item)){
			tmpMap.set(item, true);
			return true;
		}
	});
}


/**
 * array group
 * @param arr
 * @param by_key
 * @param limit limit one child
 * @returns {*}
 */
export const arrayGroup = <T extends Record<string, any>>(arr: T[], by_key: keyof T, limit?: boolean): Record<string, T[]> | Record<string, T> => {
	if(!arr || !arr.length){
		return arr as any;
	}
	let tmp_rst: Record<string, T[]> = {};
	arr.forEach((item: T) => {
		let k = item[by_key];
		if(!tmp_rst[k]){
			tmp_rst[k] = [];
		}
		tmp_rst[k].push(item);
	});
	if(!limit){
		return tmp_rst;
	}
	let rst: Record<string, T> = {};
	for(let i in tmp_rst){
		rst[i] = tmp_rst[i][0];
	}
	return rst;
};


/**
 * 按照对象 KEY 排序
 * @param {Object} obj
 * @return {{}}
 */
export const arraySortByKey = <T extends Record<string, any>>(obj: T): T => {
	return Object.keys(obj).sort().reduce(function(result: Record<string, any>, key: string){
		result[key] = obj[key];
		return result;
	}, {} as Record<string, any>) as T;
}


/**
 * 数组分块
 * @param {Array} list 数据
 * @param {Number} size 每块大小
 * @return {Array[]}
 */
export const arrayChunk = <T = any>(list: T[], size: number): T[][] => {
	let len = list.length;
	if(size < 1 || !len){
		return [];
	}
	if(size > len){
		return [list];
	}
	let res = [];
	let integer = Math.floor(len / size);
	let rest = len % size;
	for(let i = 1; i <= integer; i++){
		res.push(list.splice(0, size));
	}
	if(rest){
		res.push(list.splice(0, rest));
	}
	return res;
}