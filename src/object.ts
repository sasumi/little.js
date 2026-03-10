/**
 * 深拷贝对象
 * @param obj - 要拷贝的对象
 * @returns 拷贝后的新对象
 * @example
 * deepClone({ a: 1, b: { c: 2 } })
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 判断对象是否为空
 * @param obj - 要判断的对象
 * @returns 是否为空对象
 * @example
 * isEmptyObject({}) // true
 * isEmptyObject({ a: 1 }) // false
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0
}

/**
 * 对象属性名转换
 * @param {Object} obj
 * @param {Object} mapping
 * @return {{}}
 */
export const objectKeyMapping = (obj: Record<string, any>, mapping: Record<string, string>): Record<string, any> => {
	let ret: Record<string, any> = {};
	for(let key in obj){
		if(mapping[key] !== undefined){
			ret[mapping[key]] = obj[key];
		} else {
			ret[key] = obj[key];
		}
	}
	return ret;
}

/**
 * 获取对象指定路径的值
 * @param obj - 对象
 * @param path - 路径，例如 'a.b.c'
 * @param defaultValue - 默认值
 * @returns 获取到的值或默认值
 * @example
 * get({ a: { b: { c: 1 } } }, 'a.b.c') // 1
 * get({ a: { b: 1 } }, 'a.b.c', 0) // 0
 */
export function objectGet<T = any>(obj: any, path: string, defaultValue?: T): T {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue as T
    }
    result = result[key]
  }
  
  return result !== undefined ? result : (defaultValue as T)
}

/**
 * 设置对象指定路径的值
 * @param obj - 对象
 * @param path - 路径，例如 'a.b.c'
 * @param value - 要设置的值
 * @example
 * set({}, 'a.b.c', 1) // { a: { b: { c: 1 } } }
 */
export function objectSet(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current = obj
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[lastKey] = value
}

/**
 * 合并对象
 * @param target - 目标对象
 * @param sources - 源对象
 * @returns 合并后的对象
 * @example
 * merge({ a: 1 }, { b: 2 }, { c: 3 }) // { a: 1, b: 2, c: 3 }
 */
export function objectMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  for (const source of sources) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key]
        const targetValue = (target as any)[key]
        
        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          ;(target as any)[key] = objectMerge(targetValue, sourceValue)
        } else {
          ;(target as any)[key] = sourceValue
        }
      }
    }
  }
  return target
}
