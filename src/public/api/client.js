(() => {
    const API_BASE = '/api/v1';

    function readToken() {
        return localStorage.getItem('mekong-token');
    }

    function clearSession() {
        localStorage.removeItem('mekong-token');
        localStorage.removeItem('mekong-user');
    }

    async function apiRequest(path, options = {}) {
        const { skipAuth = false, ...fetchOptions } = options;
        let response;
        try {
            response = await fetch(`${API_BASE}${path}`, {
                ...fetchOptions,
                headers: {
                    ...(fetchOptions.body ? { 'content-type': 'application/json' } : {}),
                    ...(!skipAuth && readToken() ? { authorization: `Bearer ${readToken()}` } : {}),
                    ...fetchOptions.headers
                }
            });
        } catch {
            const error = new Error('Không kết nối được máy chủ. Kiểm tra backend và thử lại.');
            error.status = 0;
            error.network = true;
            throw error;
        }

        let result = {};
        try {
            result = await response.json();
        } catch {
            const error = new Error('Phản hồi không hợp lệ từ máy chủ.');
            error.status = response.status;
            throw error;
        }

        if (response.status === 401 && !path.startsWith('/auth/login')) {
            clearSession();
            window.dispatchEvent(new CustomEvent('mekong:session-expired'));
        }

        if (!response.ok) {
            const error = new Error(result.message || 'Có lỗi xảy ra');
            error.status = response.status;
            error.data = result;
            throw error;
        }

        return result.data;
    }

    window.mekongApi = {
        apiRequest,
        readToken,
        clearSession,
        login: (payload) => apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
            skipAuth: true
        })
    };
})();
