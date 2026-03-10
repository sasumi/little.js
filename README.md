# minut

A lightweight collection of utility functions for JavaScript/TypeScript projects.

## Installation

```bash
npm install minut
```

or

```bash
yarn add minut
```

## Usage

```typescript
import { formatDate, capitalize, deepClone } from 'minut'

// Time utilities
const now = new Date()
console.log(formatDate(now, 'YYYY-MM-DD')) // '2026-03-10'

// String utilities
console.log(capitalize('hello')) // 'Hello'

// Object utilities
const obj = { a: 1, b: { c: 2 } }
const cloned = deepClone(obj)
```

## API Reference

### Time Utilities

**Constants:**
- `YEAR_NOW` - Current year
- `MONTH_NOW` - Current month (1-12)
- `DATE_NOW` - Current day of month
- `ONE_MINUTE` - Milliseconds in one minute
- `ONE_HOUR` - Milliseconds in one hour
- `ONE_DAY` - Milliseconds in one day
- `ONE_WEEK` - Milliseconds in one week
- `ONE_MONTH30` - Milliseconds in 30 days
- `ONE_MONTH31` - Milliseconds in 31 days
- `ONE_YEAR365` - Milliseconds in 365 days
- `ONE_YEAR366` - Milliseconds in 366 days
- `DAY_SUNDAY` - Sunday constant (0)
- `DAY_MONDAY` - Monday constant (1)
- `DAY_TUESDAY` - Tuesday constant (2)
- `DAY_WEDNESDAY` - Wednesday constant (3)
- `DAY_THURSDAY` - Thursday constant (4)
- `DAY_FRIDAY` - Friday constant (5)
- `DAY_SATURDAY` - Saturday constant (6)
- `MONTH_NAMES_CN` - Chinese month names array
- `MONTH_NAMES_SHORT_CN` - Short Chinese month names array
- `WEEK_DAY_NAMES_SHORT_CN` - Short Chinese weekday names array
- `WEEK_DAY_NAMES_CN` - Chinese weekday names array

**Functions:**
- `formatDate(format: string, date?: Date | number | string | null): string` - Format date
- `countDown(timeout: number, tickFunc?: Function, onFinish?: Function)` - Countdown timer
- `msToHMS(ms: number)` - Convert milliseconds to hours/minutes/seconds

### String Utilities

**Constants:**
- `TRIM_BOTH` - Trim both sides constant
- `TRIM_LEFT` - Trim left side constant
- `TRIM_RIGHT` - Trim right side constant

**Functions:**
- `capitalize(str: string): string` - Capitalize first letter
- `camelCase(str: string): string` - Convert to camelCase
- `kebabCase(str: string): string` - Convert to kebab-case
- `truncate(str: string, length: number, suffix?: string): string` - Truncate string
- `trim(str: string, chars?: string, dir?: number): string` - Trim string
- `stripSlashes(str: string): string` - Remove slashes
- `cutString(str: string, len: number, eclipse_text?: string): string` - Cut string with ellipsis
- `extract(es_template: string, params: Record<string, any>): string` - Extract with template
- `regQuote(str: string): string` - Escape regex special characters
- `utf8Decode(srcStr: string): string` - Decode UTF-8 string
- `isJSON(json: string): boolean` - Check if string is valid JSON
- `utf8Encode(srcStr: string): string` - Encode string to UTF-8
- `getUTF8StrLen(str: string): number` - Get UTF-8 string byte length
- `randomString(length?: number, sourceStr?: string): string` - Generate random string
- `randomWords(count?: number, letterMax?: number): string` - Generate random words
- `strToPascalCase(str: string, capitalize_first?: boolean): string` - Convert to PascalCase

### Object Utilities

**Functions:**
- `deepClone<T>(obj: T): T` - Deep clone object
- `isEmptyObject(obj: object): boolean` - Check if object is empty
- `objectKeyMapping(obj: Record<string, any>, mapping: Record<string, string>): Record<string, any>` - Map object keys
- `objectGet<T>(obj: any, path: string, defaultValue?: T): T` - Get value by path
- `objectSet(obj: any, path: string, value: any): void` - Set value by path
- `objectMerge<T>(target: T, ...sources: Partial<T>[]): T` - Deep merge objects

### Array Utilities

**Functions:**
- `arrayColumn<T>(arr: T[], col_name: keyof T): any[]` - Extract column from array of objects
- `arrayIndex<T>(arr: T[], val: T): string | null` - Find index of value
- `arrayDistinct<T>(arr: T[]): T[]` - Remove duplicates
- `arrayGroup<T>(arr: T[], by_key: keyof T, limit?: boolean): Record<string, T[] | T>` - Group array by key
- `arraySortByKey<T>(obj: T): T` - Sort object by keys
- `arrayChunk<T>(list: T[], size: number): T[][]` - Split array into chunks

### Math Utilities

**Constants:**
- `GOLDEN_RATIO` - Golden ratio constant

**Functions:**
- `between(val: number, min: number, max: number, includeEqual?: boolean): boolean` - Check if value is between range
- `randomInt(min: number, max: number): number` - Generate random integer
- `round(num: number, precision?: number): number` - Round number to precision

### Base64 Utilities

**Functions:**
- `base64Decode(text: string): string` - Decode base64 string
- `base64UrlSafeEncode(text: string): string` - URL-safe base64 encode
- `Base64Encode(text: string): string` - Encode to base64
- `blobToBase64(blob: Blob): Promise<unknown>` - Convert Blob to base64

### Browser Utilities

**Functions:**
- `enterFullScreen(element: any): Promise<void>` - Enter fullscreen mode
- `exitFullScreen(): void` - Exit fullscreen mode
- `toggleFullScreen(element: any): Promise<unknown>` - Toggle fullscreen
- `isInFullScreen(): boolean` - Check if in fullscreen
- `detectLanguage(supportedLngs: string[]): string` - Detect browser language

### Cookie Utilities

**Functions:**
- `setCookie(name: string, value: string, days: number, path?: string): void` - Set cookie
- `getCookie(name: string): string | null` - Get cookie value
- `deleteCookie(name: string): void` - Delete cookie

### DOM Utilities

**Functions:**
- `hide(dom: HTMLElement | string): void` - Hide element
- `show(dom: HTMLElement | string): void` - Show element
- `remove(dom: HTMLElement | string): Node | null` - Remove element
- `disabled(el: HTMLElement | string, disabledClass?: string): void` - Disable element
- `enabled(el: HTMLElement | string, disabledClass?: string): void` - Enable element
- `toggleDisabled(el: HTMLElement | string, disabledClass?: string, forceEnabled?: boolean | null): void` - Toggle disabled state
- `lockElementInteraction(el: HTMLElement | string, payload: Function): void` - Lock element interaction
- `nodeIndex(node: HTMLElement): number` - Get node index
- `findAll(selector: string | HTMLElement, parent?: Document | HTMLElement): HTMLElement[]` - Find all elements
- `findOne(selector: string | HTMLElement, parent?: Document | HTMLElement): HTMLElement` - Find one element
- `getNodeXPath(el: HTMLElement | null): string | null` - Get element XPath
- `onDomTreeChange(dom: HTMLElement, callback: Function, includeElementChanged?: boolean): void` - Watch DOM tree changes
- `mutationEffective(dom: HTMLElement, option: MutationObserverInit, payload: Function, minInterval?: number): void` - Mutation observer with throttle
- `keepRectInContainer(rect: Dimension, container: Dimension): Dimension` - Keep rectangle in container
- `rectAssoc(rect1: Dimension, rect2: Dimension): boolean` - Check if rectangles overlap
- `loadCss(file: string, forceReload?: boolean): Promise<void>` - Load CSS file
- `loadScript(src: string, forceReload?: boolean): Promise<void>` - Load script file
- `getDomDimension(dom: HTMLElement): { width: number; height: number }` - Get element dimensions
- `insertStyleSheet(styleSheetStr: string, id?: string, doc?: Document): HTMLStyleElement | null` - Insert stylesheet
- `rectInLayout(rect: Dimension, layout: Dimension): boolean` - Check if rect is in layout
- `createDomByHtml(html: string, parentNode?: HTMLElement | null): Node | Node[]` - Create DOM from HTML
- `isFocusable(el: HTMLElement): boolean` - Check if element is focusable
- `getBoundingClientRect(el: HTMLElement, autoFixInvisible?: boolean): RectObject` - Get element bounding rect

### HTML Utilities

**Constants:**
- `BLOCK_TAGS` - Array of block-level HTML tags
- `PAIR_TAGS` - Array of paired HTML tags
- `SELF_CLOSING_TAGS` - Array of self-closing HTML tags
- `REMOVABLE_TAGS` - Array of removable HTML tags

**Functions:**
- `html2Text(html: string): string` - Convert HTML to plain text
- `cssSelectorEscape(str: string): string` - Escape CSS selector
- `entityToString(entity: string): string` - Convert HTML entity to string
- `decodeHTMLEntities(str: string): string` - Decode HTML entities
- `buildHtmlHidden(maps: Record<string, any>): string` - Build hidden input fields
- `escapeHtml(str: string, tabSize?: number, allowLineBreaker?: boolean): string` - Escape HTML
- `unescapeHtml(html: string): string` - Unescape HTML
- `escapeAttr(s: string, preserveCR?: string): string` - Escape HTML attribute
- `stringToEntity(str: string, radix?: number): string` - Convert string to HTML entity
- `highlightText(text: string, kw: string, replaceTpl?: string): string` - Highlight text

### Image Utilities

**Functions:**
- `imgToBase64(img: HTMLImageElement): string | null` - Convert image to base64
- `srcToBase64(src: string): Promise<unknown>` - Convert image src to base64

### MD5 Utility

**Functions:**
- `MD5(string: string, key?: string, raw?: boolean): string` - Generate MD5 hash

### MIME Utilities

**Constants:**
- `MIME_BINARY_DEFAULT` - Default binary MIME type
- `MIME_EXTENSION_MAP` - Map of file extensions to MIME types

### General Utilities

**Functions:**
- `guid(prefix?: string): string` - Generate unique ID
- `throttle(fn: Function, intervalMiSec: number): Function` - Throttle function
- `throttleEffect(fn: Function, intervalMiSec: number): Function` - Throttle with effect
- `debounce(fn: Function, intervalMiSec: number): Function` - Debounce function
- `isPromise(obj: any): boolean` - Check if value is Promise
- `isObject(item: any): boolean` - Check if value is object
- `isFunction(value: any): boolean` - Check if value is function
- `isURL(str: string): boolean` - Check if string is valid URL
- `printStack(): void` - Print call stack

### File Utilities

**Functions:**
- `sanitizeFileName(name: string): string` - Sanitize file name
- `blobToDataURL(blob: Blob): Promise<string>` - Convert Blob to data URL
- `fileToBase64DataURL(file: File | Blob | string): Promise<string>` - Convert file to base64 data URL
- `downloadFile(uri: string, fileName: string): void` - Download file

## License

MIT
