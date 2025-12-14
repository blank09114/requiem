(function (global)
{
    const DEFAULTS =
    { containerSelector: ".pages", pageSize: 10, windowSize: 2, startPage: 1, showEdgePages: true };

    function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

    function createEl(tag, className, text)
    {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text !== undefined) el.textContent = text;
        return el;
    }

    function createPaginator(opt)
    {
        const cfg = { ...DEFAULTS, ...opt };

        if (typeof cfg.fetchCount !== "function") throw new Error("fetchCount is required");
        if (typeof cfg.fetchPage !== "function") throw new Error("fetchPage is required");
        if (typeof cfg.renderItems !== "function") throw new Error("renderItems is required");

        let currentPage = cfg.startPage;
        let totalCount = 0;
        let totalPages = 1;

        const pagesEl = () => document.querySelector(cfg.containerSelector);

        async function refreshCount()
        {
            totalCount = await cfg.fetchCount();
            const tc = Number(totalCount) || 0;

            totalPages = Math.max(1, Math.ceil(tc / cfg.pageSize));
            currentPage = clamp(Number(currentPage) || 1, 1, totalPages);
        }

        function getWindow()
        {
            const start = Math.max(1, currentPage - cfg.windowSize);
            const end = Math.min(totalPages, currentPage + cfg.windowSize);
            return { start, end };
        }

        function makePageBtn(label, targetPage, { disabled = false, now = false } = {})
        {
            const a = createEl("a", "page" + (now ? " now" : "") + (disabled ? " disabled" : ""), label);
            a.href = "javascript:void(0)";

            if (!disabled) { a.addEventListener("click", () => { go(targetPage); }); }

            return a;
        }

        function makeEllipsis()
        {
            const a = createEl("a", "page ellipsis", "...");
            a.href = "javascript:void(0)";
            return a;
        }

        function renderPaging()
        {
            const el = pagesEl();
            if (!el) return;

            el.innerHTML = "";
            el.appendChild(makePageBtn("<", currentPage - 1, { disabled: currentPage === 1 }));

            const { start, end } = getWindow();

            if (cfg.showEdgePages && start > 1)
            {
                el.appendChild(makePageBtn("1", 1, { now: currentPage === 1 }));
                if (start > 2) el.appendChild(makeEllipsis());
            }

            for (let p = start; p <= end; p++) { el.appendChild(makePageBtn(String(p), p, { now: p === currentPage })); }

            if (cfg.showEdgePages && end < totalPages)
            {
                if (end < totalPages - 1) el.appendChild(makeEllipsis());
                el.appendChild(makePageBtn(String(totalPages), totalPages, { now: currentPage === totalPages }));
            }

            el.appendChild(makePageBtn(">", currentPage + 1, { disabled: currentPage === totalPages }));
        }

        async function load()
        {
            const data = await cfg.fetchPage(currentPage, cfg.pageSize);
            cfg.renderItems(data, currentPage);
            renderPaging();
        }

        async function go(page)
        {
            currentPage = clamp(Number(page) || 1, 1, totalPages);
            await load();
        }

        return {
            init: async () =>
            {
                await refreshCount();
                await load();
            },
            go,
            reload: async () =>
            {
                await refreshCount();
                await load();
            },
            getState: () => ({
                page: currentPage,
                totalCount,
                totalPages,
                pageSize: cfg.pageSize
            })
        };
    }

    global.createPaginator = createPaginator;
})(window);