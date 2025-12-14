let paginator = null;
let currentTagId = null;

// 날짜 포맷
function formatDate(iso)
{
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "yyyy.mm.dd.";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}.`;
}

// 카테고리 ID - 이름 맵
function buildCategoryMap()
{
    const map = new Map();
    document.querySelectorAll(".categories a.category[data-tag-id]").forEach(a =>
    {
        const id = Number(a.dataset.tagId);
        const name = a.textContent.replace("·", "").trim();
        if (!Number.isNaN(id)) map.set(id, name);
    });
    return map;
}

// 현재 카테고리 UI 표시
function setActiveCategoryUI(target)
{
    document.querySelectorAll(".categories .category").forEach(el => el.classList.remove("now") );
    if (target) target.classList.add("now");
}

// 게시글 렌더링
function renderPostList(list)
{
    const wrap = document.querySelector(".postList");
    if (!wrap) return;

    wrap.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0)
    {
        const empty = document.createElement("p");
        empty.className = "text2 center";
        empty.textContent = "등록된 게시글이 없습니다.";
        wrap.appendChild(empty);
        return;
    }

    const catMap = buildCategoryMap();

    list.forEach(item =>
    {
        const a = document.createElement("a");
        a.className = "postItem";
        a.href = `/board/${item.postId}`;

        const cat = document.createElement("span");
        cat.className = "text2 ton3";
        cat.textContent = catMap.get(item.tagId) ?? "";

        const title = document.createElement("span");
        title.className = "text1 left";
        title.textContent = item.postTitle ?? "";

        const date = document.createElement("span");
        date.className = "text2 ton3";
        date.textContent = formatDate(item.postDate);

        a.appendChild(cat);
        a.appendChild(title);
        a.appendChild(date);

        wrap.appendChild(a);
    });
}

// API URL 빌더
function buildCountUrl()
{ return currentTagId ? `/api/board/count?tagId=${encodeURIComponent(currentTagId)}` : `/api/board/count`; }

function buildListUrl(page)
{
    const base = `/api/board/list?page=${page}`;
    return currentTagId ? `${base}&tagId=${encodeURIComponent(currentTagId)}` : base;
}

// 카테고리 편집 폼 오픈
function toggleCategoryForm()
{
    const wrap = document.querySelector(".categoryFormsWrap");
    const editBtn = document.querySelector(".categories button.category");
    const willOpen = wrap.style.display !== "flex";

    wrap.style.display = willOpen ? "flex" : "none";
    editBtn.classList.toggle("now", willOpen);
}

function getInputValue(inputId, emptyMsg)
{
    const input = document.getElementById(inputId);
    const value = input.value.trim();

    if (!value) { showToast(emptyMsg); return null; }
    return { input, value };
}

// 카테고리 추가
async function addCategory(event)
{
    event?.preventDefault();

    const result = getInputValue("addCategoryInput", "추가할 카테고리를 입력해주세요.");
    if (!result) return;

    const { input, value } = result;

    try
    {
        const res = await fetch("/api/categories/add",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tagName: value })
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) { showToast(json.message || "카테고리 등록 실패"); return; }

        input.value = "";
        showToast("카테고리가 등록되었습니다.");

        location.reload();
    }
    catch (e)
    {
        console.error(e);
        showToast("서버 연결 실패");
    }
}

// 카테고리 삭제
async function deleteCategory(event)
{
    event?.preventDefault();

    const result = getInputValue("deleteCategoryInput", "삭제할 카테고리를 입력해주세요.");
    if (!result) return;

    const { input, value } = result;

    if (!confirm(`카테고리 '${value}'와 해당 게시글을 전부 삭제하시겠습니까?`)) return;

    try
    {
        const res = await fetch(`/api/categories/delete?tagName=${encodeURIComponent(value)}`,
        { method: "DELETE" });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) { showToast(json.message || "카테고리 삭제 실패"); return; }

        input.value = "";
        showToast("카테고리가 삭제되었습니다.");

        location.reload();
    }
    catch (e) { console.error(e); showToast("서버 연결 실패"); }
}

// 초기화
document.addEventListener("DOMContentLoaded", () =>
{
    // 카테고리 클릭 바인딩
    const allBtn = document.querySelector(".categories .category:not([data-tag-id])");
    if (allBtn)
    {
        allBtn.addEventListener("click", async () =>
        {
            currentTagId = null;
            setActiveCategoryUI(allBtn);
            paginator?.go(1);
        });
    }

    document.querySelectorAll(".categories .category[data-tag-id]").forEach(a =>
    {
        a.addEventListener("click", async () =>
        {
            currentTagId = Number(a.dataset.tagId);
            setActiveCategoryUI(a);
            paginator?.go(1);
        });
    });

    paginator = createPaginator({
        containerSelector: ".pages",
        pageSize: 10,
        windowSize: 2,

        fetchCount: async () =>
        {
            const res = await fetch(buildCountUrl());
            if (!res.ok) throw new Error("count API 실패");
            const data = await res.json();
            return Number(data.count ?? 0);
        },

        fetchPage: async (page) =>
        {
            const res = await fetch(buildListUrl(page));
            if (!res.ok) throw new Error("list API 실패");
            return await res.json();
        },

        renderItems: (list) => renderPostList(list)
    });

    paginator.init().catch(e => { console.error(e); showToast("게시글을 불러오지 못했습니다."); });
});