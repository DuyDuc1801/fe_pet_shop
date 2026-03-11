const BASE_URL = "http://localhost:5000/api";

/**
 * Hàm gọi API chuẩn hóa — tự động gắn Bearer token nếu có
 *
 * @param {string} endpoint  - VD: "auth/login", "appointments", "products/123"
 * @param {object} body      - Request body (với POST/PUT)
 * @param {string} method    - "GET" | "POST" | "PUT" | "DELETE"  (mặc định POST)
 * @returns {{ res: Response, data: any }}
 */
const fetchApi = async (endpoint, body = null, method = "POST") => {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (body && method !== "GET") {
        options.body = JSON.stringify(body);
    }

    try {
        const res = await fetch(`${BASE_URL}/${endpoint}`, options);
        const data = await res.json();
        return { res, data };
    } catch (error) {
        console.error(`[fetchApi] Lỗi gọi API "${endpoint}":`, error);
        return {
            res: { status: false, ok: false },
            data: { message: "Lỗi kết nối máy chủ." }
        };
    }
};

export default fetchApi;