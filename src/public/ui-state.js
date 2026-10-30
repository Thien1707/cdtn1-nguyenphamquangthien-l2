(() => {
    function renderDataState(container, { loading = false, error = '', empty = false, emptyMessage = 'Chưa có dữ liệu', onRetry = null } = {}) {
        if (!container) {
            return;
        }
        if (loading) {
            container.innerHTML = '<p class="subtle state-loading" role="status">Đang tải dữ liệu...</p>';
            return;
        }
        if (error) {
            container.innerHTML = `<div class="state-error panel" role="alert">
            <p class="error">${error}</p>
            ${onRetry ? '<button type="button" class="button secondary retry-button">Thử lại</button>' : ''}
        </div>`;
            if (onRetry) {
                container.querySelector('.retry-button')?.addEventListener('click', onRetry);
            }
            return;
        }
        if (empty) {
            container.innerHTML = `<p class="empty state-empty">${emptyMessage}</p>`;
        }
    }

    window.mekongUi = { renderDataState };
})();
