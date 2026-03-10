import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { queryToObj, queryReplace, objToQuery, request } from "../src/net";

describe("queryToObj", () => {
    it("should convert query string to object", () => {
        const query = "name=test&age=25&city=beijing";
        const result = queryToObj(query);
        expect(result).toEqual({
            name: "test",
            age: "25",
            city: "beijing",
        });
    });

    it("should handle query string with leading question mark", () => {
        const query = "?foo=bar&baz=qux";
        const result = queryToObj(query);
        expect(result).toEqual({
            foo: "bar",
            baz: "qux",
        });
    });

    it("should decode URI components", () => {
        const query = "name=%E6%B5%8B%E8%AF%95&email=test%40example.com";
        const result = queryToObj(query);
        expect(result).toEqual({
            name: "测试",
            email: "test@example.com",
        });
    });

    it("should handle empty values", () => {
        const query = "key1=&key2=value2";
        const result = queryToObj(query);
        expect(result).toEqual({
            key1: "",
            key2: "value2",
        });
    });

    it("should handle empty query string", () => {
        const query = "";
        const result = queryToObj(query);
        expect(result).toEqual({});
    });
});

describe("queryReplace", () => {
    it("should replace query parameters", () => {
        const url = "https://example.com?page=1&size=10";
        const newQuery = { page: "2" };
        const result = queryReplace(url, newQuery);
        expect(result).toBe("https://example.com?page=2&size=10");
    });

    it("should add new query parameters", () => {
        const url = "https://example.com?page=1";
        const newQuery = { size: "20", filter: "active" };
        const result = queryReplace(url, newQuery);
        expect(result).toContain("page=1");
        expect(result).toContain("size=20");
        expect(result).toContain("filter=active");
    });

    it("should work with URL without query string", () => {
        const url = "https://example.com";
        const newQuery = { page: "1" };
        const result = queryReplace(url, newQuery);
        expect(result).toBe("https://example.com?page=1");
    });

    it("should handle complex URLs", () => {
        const url = "https://example.com/path/to/resource?existing=param";
        const newQuery = { new: "value" };
        const result = queryReplace(url, newQuery);
        expect(result).toContain("/path/to/resource?");
        expect(result).toContain("existing=param");
        expect(result).toContain("new=value");
    });
});

describe("objToQuery", () => {
    it("should convert object to query string", () => {
        const data = { name: "test", age: 25, city: "beijing" };
        const result = objToQuery(data);
        expect(result).toContain("name=test");
        expect(result).toContain("age=25");
        expect(result).toContain("city=beijing");
    });

    it("should skip null values", () => {
        const data = { name: "test", age: null, city: "beijing" };
        const result = objToQuery(data);
        expect(result).toContain("name=test");
        expect(result).not.toContain("age");
        expect(result).toContain("city=beijing");
    });

    it("should handle array values", () => {
        const data = { tags: ["tag1", "tag2", "tag3"] };
        const result = objToQuery(data);
        expect(result).toContain("tags=tag1");
        expect(result).toContain("tags=tag2");
        expect(result).toContain("tags=tag3");
    });

    it("should handle mixed types", () => {
        const data = {
            string: "hello",
            number: 123,
            boolean: true,
        };
        const result = objToQuery(data);
        expect(result).toContain("string=hello");
        expect(result).toContain("number=123");
        expect(result).toContain("boolean=true");
    });

    it("should return input if not an object", () => {
        const result1 = objToQuery(undefined as any);
        const result2 = objToQuery("string" as any);
        expect(result1).toBeUndefined();
        expect(result2).toBe("string");
    });

    it("should handle empty object", () => {
        const data = {};
        const result = objToQuery(data);
        expect(result).toBe("");
    });

    it("should handle object values (skip nested objects)", () => {
        const data = { nested: { key: "value" }, normal: "test" };
        const result = objToQuery(data);
        expect(result).toContain("normal=test");
        expect(result).not.toContain("nested");
    });

    it("should handle empty arrays", () => {
        const data = { emptyArray: [], name: "test" };
        const result = objToQuery(data);
        expect(result).toContain("name=test");
    });
});

describe("request", () => {
    beforeEach(() => {
        // Mock fetch
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should make a GET request by default", async () => {
        const mockResponse = {
            ok: true,
            status: 200,
            json: async () => ({ data: "test" }),
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await request("https://api.example.com/data", null, {});
        
        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.example.com/data",
            expect.objectContaining({
                method: "GET",
                headers: {},
            })
        );
        expect(result).toBe(mockResponse);
    });

    it("should make a POST request with data", async () => {
        const mockResponse = {
            ok: true,
            status: 201,
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const postData = JSON.stringify({ name: "test" });
        await request("https://api.example.com/data", postData, {
            method: "POST",
            ContentType: "application/json",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.example.com/data",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: postData,
            })
        );
    });

    it("should set Accept header when provided", async () => {
        const mockResponse = { ok: true, status: 200 };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await request("https://api.example.com/data", null, {
            Accept: "application/json",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.example.com/data",
            expect.objectContaining({
                headers: { Accept: "application/json" },
            })
        );
    });

    it("should handle FormData", async () => {
        const mockResponse = { ok: true, status: 200 };
        (global.fetch as any).mockResolvedValue(mockResponse);

        const formData = new FormData();
        formData.append("file", "test");

        await request("https://api.example.com/upload", formData, {
            method: "POST",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.example.com/upload",
            expect.objectContaining({
                method: "POST",
                body: formData,
            })
        );
    });

    it("should throw error on non-ok response", async () => {
        const mockResponse = {
            ok: false,
            status: 404,
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await expect(
            request("https://api.example.com/notfound", null, {})
        ).rejects.toThrow("HTTP error! status: 404");
    });

    it("should support timeout option", async () => {
        const mockResponse = { ok: true, status: 200 };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await request("https://api.example.com/data", null, {
            timeout: 5000,
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.example.com/data",
            expect.objectContaining({
                signal: expect.any(AbortSignal),
            })
        );
    });

    it("should abort request on timeout", async () => {
        vi.useFakeTimers();

        const mockAbort = vi.fn();
        global.AbortController = vi.fn(() => ({
            signal: {} as AbortSignal,
            abort: mockAbort,
        })) as any;

        (global.fetch as any).mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve({ ok: true }), 10000);
                })
        );

        const promise = request("https://api.example.com/slow", null, {
            timeout: 1000,
        });

        vi.advanceTimersByTime(1000);

        expect(mockAbort).toHaveBeenCalled();

        vi.useRealTimers();
    });

    it("should handle custom headers", async () => {
        const mockResponse = { ok: true, status: 200 };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await request("https://api.example.com/data", null, {
            headers: {
                Authorization: "Bearer token123",
                "X-Custom-Header": "custom-value",
            },
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.example.com/data",
            expect.objectContaining({
                headers: {
                    Authorization: "Bearer token123",
                    "X-Custom-Header": "custom-value",
                },
            })
        );
    });

    it("should merge ContentType with existing headers", async () => {
        const mockResponse = { ok: true, status: 200 };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await request("https://api.example.com/data", null, {
            headers: { Authorization: "Bearer token" },
            ContentType: "application/json",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api.example.com/data",
            expect.objectContaining({
                headers: {
                    Authorization: "Bearer token",
                    "Content-Type": "application/json",
                },
            })
        );
    });
});
