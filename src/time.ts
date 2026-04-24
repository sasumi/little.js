export const YEAR_NOW = new Date().getFullYear();
export const MONTH_NOW = new Date().getMonth() + 1;
export const DATE_NOW = new Date().getDate();

export const ONE_MINUTE = 60 * 1000;
export const ONE_HOUR = 60 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const ONE_WEEK = 7 * ONE_DAY;
export const ONE_MONTH30 = 30 * ONE_DAY;
export const ONE_MONTH31 = 31 * ONE_DAY;
export const ONE_YEAR365 = 365 * ONE_DAY;
export const ONE_YEAR366 = 366 * ONE_DAY;

export const DAY_SUNDAY = 0;
export const DAY_MONDAY = 1;
export const DAY_TUESDAY = 2;
export const DAY_WEDNESDAY = 3;
export const DAY_THURSDAY = 4;
export const DAY_FRIDAY = 5;
export const DAY_SATURDAY = 6;

// 星期和月份的常量定义
export const WEEK_DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEK_DAY_NAMES_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MONTH_NAMES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTH_NAMES_SHORT_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const MONTH_NAMES_CN = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
export const MONTH_NAMES_SHORT_CN = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export const WEEK_DAY_NAMES_SHORT_CN = ["日", "一", "二", "三", "四", "五", "六"];
export const WEEK_DAY_NAMES_CN = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

/**
 * 倒计时函数（该方法采用 setTimeout 方式，不够精准）
 * @param {number} timeout - 倒计时总秒数
 * @param {Function} [tickFunc] - 每秒回调函数，接收剩余秒数作为参数
 * @param {Function} [onFinish] - 倒计时结束回调函数
 * @returns {void}
 * @example
 * countDown(10, (sec) => console.log(sec), () => console.log('done'))
 */
export const countDown = (timeout: number, tickFunc?: (timeout: number) => void, onFinish?: () => void) => {
    let loop = () => {
        tickFunc && tickFunc(timeout);
        if (timeout-- > 0) {
            setTimeout(loop, 1000);
            return;
        }
        onFinish && onFinish();
    };
    loop();
};

/**
 * 毫秒转换为“时分秒前”格式
 * @param {number} ms - 毫秒数
 * @returns {string} 返回格式化后的字符串
 * @example
 * msToHMS(3661000) // '1小时0分钟1秒前'
 */
export const msToHMS = (ms: number) => {
    if (!ms || ms < 10) {
        return "刚刚";
    }
    ms = Math.floor(ms / 1000); // 转为秒
    const h = Math.floor(ms / 3600);
    const m = Math.floor((ms % 3600) / 60);
    const s = ms % 60;
    let str = "";
    if (h > 0) str += h + "小时";
    if (m > 0 || h > 0) str += m + "分钟";
    str += s + "秒前";
    return str;
};

/**
 * PHP 时间函数映射
 * 具体含义可以参考：http://php.net/manual/en/function.date.php
 * 或者 php.date.en.md
 */
const PHP_DATE_CHAR_MAP: Record<string, (dateObj: Date) => string | number | boolean> = {
    d: (dateObj: Date) => {
        let d = dateObj.getDate();
        return (d < 10 ? "0" : "") + d;
    },
    D: (dateObj: Date) => {
        return WEEK_DAY_NAMES_SHORT_EN[dateObj.getDay()];
    },
    j: (dateObj: Date) => {
        return dateObj.getDate();
    },
    l: (dateObj: Date) => {
        return WEEK_DAY_NAMES_EN[dateObj.getDay()];
    },
    N: (dateObj: Date) => {
        let N = dateObj.getDay();
        return N === 0 ? 7 : N;
    },
    S: (dateObj: Date) => {
        let S = dateObj.getDate();
        return S % 10 === 1 && S !== 11 ? "st" : S % 10 === 2 && S !== 12 ? "nd" : S % 10 === 3 && S !== 13 ? "rd" : "th";
    },
    w: (dateObj: Date) => {
        return dateObj.getDay();
    },
    z: (dateObj: Date) => {
        let d = new Date(dateObj.getFullYear(), 0, 1);
        return Math.ceil((dateObj.getTime() - d.getTime()) / 86400000);
    },
    // Week
    W: (dateObj: Date) => {
        let target = new Date(dateObj.valueOf());
        let dayNr = (dateObj.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        let firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
        }
        let retVal = 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);

        return retVal < 10 ? "0" + retVal : retVal;
    },
    // Month
    F: (dateObj: Date) => {
        return MONTH_NAMES_EN[dateObj.getMonth()];
    },
    m: (dateObj: Date) => {
        let m = dateObj.getMonth();
        return (m < 9 ? "0" : "") + (m + 1);
    },
    M: (dateObj: Date) => {
        return MONTH_NAMES_SHORT_EN[dateObj.getMonth()];
    },
    n: (dateObj: Date) => {
        return dateObj.getMonth() + 1;
    },
    t: (dateObj: Date) => {
        let year = dateObj.getFullYear();
        let nextMonth = dateObj.getMonth() + 1;
        if (nextMonth === 12) {
            year = year++;
            nextMonth = 0;
        }
        return new Date(year, nextMonth, 0).getDate();
    },
    // Year
    L: (dateObj: Date) => {
        let L = dateObj.getFullYear();
        return L % 400 === 0 || (L % 100 !== 0 && L % 4 === 0);
    },
    o: (dateObj: Date) => {
        let d = new Date(dateObj.valueOf());
        d.setDate(d.getDate() - ((dateObj.getDay() + 6) % 7) + 3);
        return d.getFullYear();
    },
    Y: (dateObj: Date) => {
        return dateObj.getFullYear();
    },
    y: (dateObj: Date) => {
        return ("" + dateObj.getFullYear()).substr(2);
    },
    // Time
    a: (dateObj: Date) => {
        return dateObj.getHours() < 12 ? "am" : "pm";
    },
    A: (dateObj: Date) => {
        return dateObj.getHours() < 12 ? "AM" : "PM";
    },
    B: (dateObj: Date) => {
        return Math.floor(((((dateObj.getUTCHours() + 1) % 24) + dateObj.getUTCMinutes() / 60 + dateObj.getUTCSeconds() / 3600) * 1000) / 24);
    },
    g: (dateObj: Date) => {
        return dateObj.getHours() % 12 || 12;
    },
    G: (dateObj: Date) => {
        return dateObj.getHours();
    },
    h: (dateObj: Date) => {
        let h = dateObj.getHours();
        return ((h % 12 || 12) < 10 ? "0" : "") + (h % 12 || 12);
    },
    H: (dateObj: Date) => {
        let H = dateObj.getHours();
        return (H < 10 ? "0" : "") + H;
    },
    i: (dateObj: Date) => {
        let i = dateObj.getMinutes();
        return (i < 10 ? "0" : "") + i;
    },
    s: (dateObj: Date) => {
        let s = dateObj.getSeconds();
        return (s < 10 ? "0" : "") + s;
    },
    v: (dateObj: Date) => {
        let v = dateObj.getMilliseconds();
        return (v < 10 ? "00" : v < 100 ? "0" : "") + v;
    },
    // Timezone
    e: (_dateObj: Date) => {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    },
    I: (dateObj: Date) => {
        let DST = null;
        for (let i = 0; i < 12; ++i) {
            let d = new Date(dateObj.getFullYear(), i, 1);
            let offset = d.getTimezoneOffset();

            if (DST === null) DST = offset;
            else if (offset < DST) {
                DST = offset;
                break;
            } else if (offset > DST) break;
        }
        return dateObj.getTimezoneOffset() === DST ? 1 : 0;
    },
    O: (dateObj: Date) => {
        let O = dateObj.getTimezoneOffset();
        return (
            (-O < 0 ? "-" : "+") +
            (Math.abs(O / 60) < 10 ? "0" : "") +
            Math.floor(Math.abs(O / 60)) +
            (Math.abs(O % 60) === 0 ? "00" : (Math.abs(O % 60) < 10 ? "0" : "") + Math.abs(O % 60))
        );
    },
    P: (dateObj: Date) => {
        let P = dateObj.getTimezoneOffset();
        return (
            (-P < 0 ? "-" : "+") +
            (Math.abs(P / 60) < 10 ? "0" : "") +
            Math.floor(Math.abs(P / 60)) +
            ":" +
            (Math.abs(P % 60) === 0 ? "00" : (Math.abs(P % 60) < 10 ? "0" : "") + Math.abs(P % 60))
        );
    },
    T: (dateObj: Date) => {
        let tz = dateObj.toLocaleTimeString(navigator.language, { timeZoneName: "short" }).split(" ");
        return tz[tz.length - 1];
    },
    Z: (dateObj: Date) => {
        return -dateObj.getTimezoneOffset() * 60;
    },
    // Full Date/Time
    c: (dateObj: Date) => {
        return formatDate("Y-m-d\\TH:i:sP", dateObj);
    },
    r: (dateObj: Date) => {
        return dateObj.toString();
    },
    U: (dateObj: Date) => {
        return Math.floor(dateObj.getTime() / 1000);
    },
};

/**
 * 格式化日期（以 PHP 方式格式化）
 * @param {string} format - 格式化字符串（支持 PHP date 函数的格式）
 * @param {Date|number|string|null} [date=null] - 日期，可以是日期对象、毫秒数或者日期字符串，缺省为今天
 * @returns {string} 返回格式化后的日期字符串
 * @example
 * formatDate('Y-m-d H:i:s') // '2024-03-11 15:30:00'
 */
export const formatDate = function (format: string, date: Date | number | string | null = null): string {
    let dateObj = null;
    if (typeof date === "object" && date !== null) {
        dateObj = date;
    } else {
        dateObj = new Date(date || Date.now());
    }
    return format.replace(/(\\?)(.)/g, function (_: string, esc: string, chr: string): string {
        return esc === "" && PHP_DATE_CHAR_MAP[chr] ? String(PHP_DATE_CHAR_MAP[chr](dateObj)) : chr;
    });
};

/**
 * 根据时区名称获取该时区相对于 UTC 的分钟偏移量（分钟）
 * @param timeZone - 时区名称（如 "America/New_York"）
 * @param date - 可选的日期对象，默认为当前时间
 */
export const getTimezoneOffsetMinutes = (timeZone: string): number => {
    const date = new Date();
    const utcFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });

    const tzFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });

    const utcParts = utcFormatter.formatToParts(date);
    const tzParts = tzFormatter.formatToParts(date);

    const getTimestamp = (parts: Intl.DateTimeFormatPart[]) => {
        const year = parts.find(p => p.type === 'year')!.value;
        const month = parts.find(p => p.type === 'month')!.value;
        const day = parts.find(p => p.type === 'day')!.value;
        const hour = parts.find(p => p.type === 'hour')!.value;
        const minute = parts.find(p => p.type === 'minute')!.value;
        const second = parts.find(p => p.type === 'second')!.value;
        return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    };

    const utcTime = getTimestamp(utcParts);
    const tzTime = getTimestamp(tzParts);
    const offsetMinutes = (utcTime - tzTime) / 1000 / 60;
    return offsetMinutes;
}

export const convertMinutesToTimezoneOffsetStr = (offsetMinutes: number): string => {
    const offsetHours = Math.floor(offsetMinutes / 60);
    const offsetRemainingMinutes = Math.abs(offsetMinutes % 60);
    return `${offsetHours >= 0 ? "+" : "-"}${String(Math.abs(offsetHours)).padStart(2, "0")}:${String(offsetRemainingMinutes).padStart(2, "0")}`;
}

/**
 * 根据时区名称获取该时区相对于 UTC 的偏移字符串（格式为 "+HH:MM" 或 "-HH:MM"）
 * @param timeZone - 时区名称（如 "America/New_York"）
 * @returns 偏移字符串（如 "-05:00"）
 * @example
 * getTimezoneOffsetStr("America/New_York") // "-05:00"
 */
export const getTimezoneOffsetStr = (timeZone: string): string => {
    const offsetMinutes = getTimezoneOffsetMinutes(timeZone);
    return convertMinutesToTimezoneOffsetStr(offsetMinutes);
};

/**
 * 获取日期所在周数（ISO 8601 标准）
 * @param {Date} date - 日期对象
 * @returns {number} 返回周数
 * @example
 * getWeekNumber(new Date('2024-03-11')) // 11
 */
export const getWeekNumber = (date: Date): number => {
    return formatDate("W", date) as unknown as number;
}