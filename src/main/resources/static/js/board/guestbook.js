let paginator = null;

// 공통
function formatDate(iso)
{
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "yyyy.mm.dd.";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}.`;
}

// 비밀글 열람 권한 관리
function canSeeSecret(item)
{
    const me = window.CURRENT_USER_ID;
    return !!window.IS_ADMIN || (me && item && item.userId === me);
}

// 방명록 등록
async function submitGuestbook()
{
    const textarea = document.getElementById("guestbook");
    const content = textarea?.value?.trim() ?? "";

    if (content === "")
    {
        showToast("입력된 내용이 없습니다.");
        textarea?.focus();
        return;
    }

    const secret = document.getElementById("guestbookSecret")?.checked ?? false;

    const payload =
    {
        guestbookContent: content,
        guestbookSecret: secret
    };

    try
    {
        const res = await fetch("/api/guestbook/submit",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        if (res.status === 401)
        {
            showToast("로그인이 필요합니다.");
            return;
        }

        const json = await res.json().catch(() => ({}));
        if (!res.ok)
        {
            console.error("등록 실패:", res.status, json);
            showToast(json.message || "방명록 등록에 실패했습니다.");
            return;
        }

        showToast("등록됐습니다.");
        textarea.value = "";
        const chk = document.getElementById("guestbookSecret");
        if (chk) chk.checked = false;

        if (paginator) await paginator.go(1);
        else location.reload();
    }
    catch (e)
    {
        console.error(e);
        showToast("네트워크 오류가 발생했습니다.");
    }
}

// 렌더링
function renderGuestbook(list)
{
    const wrap = document.querySelector(".guestbookList");
    if (!wrap) return;

    wrap.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0)
    {
        const empty = document.createElement("p");
        empty.className = "text2 center";
        empty.textContent = "등록된 방명록이 없습니다.";
        wrap.appendChild(empty);
        return;
    }

    list.forEach(item => wrap.appendChild(createGuestbookItem(item)));
}

// UI 생성
function createGuestbookItem(item)
{
    const guestbookItem = document.createElement("div");
    guestbookItem.className = "guestbookItem";
    guestbookItem.dataset.guestbookId = item.guestbookId ?? "";
    guestbookItem.dataset.userId = item.userId ?? "";

    const g = document.createElement("div");
    g.className = "guestbook";

    const nickname = document.createElement("p");
    nickname.className = "text1 left";

    const name = item.userName ?? "사용자";
    const id = item.userId ?? "";

    nickname.textContent = window.IS_ADMIN && id ? `${name} (${id})` : name;

    const date = document.createElement("p");
    date.className = "text3 ton3";
    date.textContent = formatDate(item.guestbookDate);

    const content = document.createElement("p");
    content.className = "text2";

    const isSecret = !!item.guestbookSecret;
    const showReal = !isSecret || canSeeSecret(item);
    content.textContent = showReal ? (item.guestbookContent ?? "") : "비밀글입니다.";

    g.appendChild(nickname);
    g.appendChild(date);

    const hasAnswer = (item.answerContent ?? "").trim() !== "";

    // 관리자 버튼
    if (window.IS_ADMIN)
    {
        const btnWrap = document.createElement("div");
        btnWrap.className = "guestbookBtnsWrap";

        if (!hasAnswer)
        {
            const btnAnswer = document.createElement("button");
            btnAnswer.className = "btn purple";
            btnAnswer.type = "button";
            btnAnswer.textContent = "답변하기";
            btnAnswer.onclick = () => toggleAnswerForm(btnAnswer);
            btnWrap.appendChild(btnAnswer);
        }

        const btnBlock = document.createElement("button");
        btnBlock.className = "btn red";
        btnBlock.type = "button";
        btnBlock.textContent = "차단";
        btnBlock.onclick = () => block(btnBlock);

        btnWrap.appendChild(btnBlock);
        g.appendChild(btnWrap);
    }

    g.appendChild(content);

    guestbookItem.appendChild(g);

    // 답변 입력 폼
    if (window.IS_ADMIN && !hasAnswer)
    {
        const form = document.createElement("form");
        form.className = "guestbookForm";
        form.setAttribute("name", "answerForm");
        form.style.display = "none";

        const formHeader = document.createElement("div");
        formHeader.className = "formHeader";

        const h2 = document.createElement("h2");
        h2.className = "text1 left";
        h2.textContent = "답변하기";

        const headerLeft = document.createElement("div");
        headerLeft.className = "formHeaderLeft";

        const submitBtn = document.createElement("button");
        submitBtn.className = "btn purple";
        submitBtn.type = "button";
        submitBtn.textContent = "등록";
        submitBtn.onclick = () => submitAnswar(submitBtn);

        headerLeft.appendChild(submitBtn);
        formHeader.appendChild(h2);
        formHeader.appendChild(headerLeft);

        const ta = document.createElement("textarea");
        ta.className = "formContent";
        ta.setAttribute("name", "answer");

        form.appendChild(formHeader);
        form.appendChild(ta);
        guestbookItem.appendChild(form);
    }

    // 답변 표시
    if (hasAnswer)
    {
        const ans = document.createElement("div");
        ans.className = "guestbook answer";

        const ansLabel = document.createElement("p");
        ansLabel.className = "text1 left";
        ansLabel.textContent = "답변";

        ans.appendChild(ansLabel);

        if (window.IS_ADMIN)
        {
            const btnWrap = document.createElement("div");
            btnWrap.className = "guestbookBtnsWrap";

            const del = document.createElement("button");
            del.className = "btn red";
            del.type = "button";
            del.textContent = "삭제";
            del.onclick = () => deleteAnswer(del);

            btnWrap.appendChild(del);
            ans.appendChild(btnWrap);
        }

        const ansContent = document.createElement("p");
        ansContent.className = "text2";
        ansContent.textContent = item.answerContent;

        ans.appendChild(ansContent);

        guestbookItem.appendChild(ans);
    }

    return guestbookItem;
}

// 답변 폼 토글
function toggleAnswerForm(button)
{
    const guestbookItem = button?.closest(".guestbookItem");
    const answerForm = guestbookItem?.querySelector('form[name="answerForm"]');

    if (!guestbookItem) return;
    if (!answerForm) return;

    if (answerForm.style.display === "none" || answerForm.style.display === "")
    { answerForm.style.display = "flex"; }
    else { answerForm.style.display = "none"; }
}

// 답변 등록
async function submitAnswar(button)
{
    const guestbookItem = button?.closest(".guestbookItem");
    if (!guestbookItem) return;

    const guestbookId = Number(guestbookItem.dataset.guestbookId);
    if (!guestbookId)
    {
        showToast("guestbookId가 없습니다.");
        return;
    }

    const answerForm = guestbookItem.querySelector('form[name="answerForm"]');
    if (!answerForm) return;

    const textarea = answerForm.querySelector('textarea[name="answer"]');
    if (!textarea) return;

    const content = textarea.value.trim();
    if (content === "")
    {
        showToast("입력된 내용이 없습니다.");
        textarea.focus();
        return;
    }

    try
    {
        const res = await fetch(`/api/guestbook/${guestbookId}/answer`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ answerContent: content })
        });

        const json = await res.json().catch(() => ({}));

        if (res.status === 401)
        {
            showToast("로그인이 필요합니다.");
            return;
        }
        if (res.status === 403)
        {
            showToast("권한이 없습니다.");
            return;
        }

        if (!res.ok)
        {
            showToast(json.message || "답변 등록에 실패했습니다.");
            return;
        }

        showToast("답변이 등록되었습니다.");

        textarea.value = "";
        answerForm.style.display = "none";

        if (paginator?.reload) await paginator.reload();
        else if (paginator?.go) await paginator.go(1);
        else location.reload();
    }
    catch (e) { console.error(e); showToast("네트워크 오류가 발생했습니다."); }
}

// 차단
async function block(button)
{
    const guestbookItem = button?.closest(".guestbookItem");
    if (!guestbookItem) return;

    const guestbookId = Number(guestbookItem.dataset.guestbookId);
    if (!guestbookId) { showToast("guestbookId가 없습니다."); return; }

    const nicknameTag = guestbookItem.querySelector(".text1.left");
    const nickname = nicknameTag ? nicknameTag.textContent.trim() : "사용자";

    const ok = confirm(`${nickname} 님을 차단하고, 해당 유저의 방명록을 모두 삭제하시겠습니까?`);
    if (!ok) return;

    try
    {
        const res = await fetch(`/api/guestbook/${guestbookId}/block`,
        { method: "POST", credentials: "include" });

        const json = await res.json().catch(() => ({}));

        if (res.status === 401) { showToast("로그인이 필요합니다."); return; }
        if (res.status === 403) { showToast("권한이 없습니다."); return; }

        if (!res.ok)
        {
            showToast(json.message || "차단 처리에 실패했습니다.");
            return;
        }

        showToast(`차단 완료! 삭제된 방명록: ${json.deletedCount ?? 0}개`);

        if (paginator?.reload) await paginator.reload();
        else if (paginator?.go) await paginator.go(1);
        else location.reload();
    }
    catch (e) { console.error(e); showToast("네트워크 오류가 발생했습니다."); }
}

// 답변 삭제
async function deleteAnswer(button)
{
    const guestbookItem = button?.closest(".guestbookItem");
    if (!guestbookItem) return;

    const guestbookId = Number(guestbookItem.dataset.guestbookId);
    if (!guestbookId)
    {
        showToast("guestbookId가 없습니다.");
        return;
    }

    const ok = confirm("답변을 삭제하시겠습니까?");
    if (!ok) return;

    try
    {
        const res = await fetch(`/api/guestbook/${guestbookId}/answer`,
        {
            method: "DELETE",
            credentials: "include"
        });

        const json = await res.json().catch(() => ({}));

        if (res.status === 401)
        {
            showToast("로그인이 필요합니다.");
            return;
        }
        if (res.status === 403)
        {
            showToast("권한이 없습니다.");
            return;
        }

        if (!res.ok)
        {
            showToast(json.message || "답변 삭제에 실패했습니다.");
            return;
        }

        showToast("답변이 삭제되었습니다.");

        if (paginator?.reload) await paginator.reload();
        else if (paginator?.go) await paginator.go(1);
        else location.reload();
    }
    catch (e) { console.error(e); showToast("네트워크 오류가 발생했습니다."); }
}

// 페이지 초기화
document.addEventListener("DOMContentLoaded", () =>
{
    if (typeof window.IS_ADMIN === "undefined") window.IS_ADMIN = false;
    if (typeof window.CURRENT_USER_ID === "undefined") window.CURRENT_USER_ID = null;

    paginator = createPaginator({
        containerSelector: ".pages",
        pageSize: 5,
        windowSize: 2,

        fetchCount: async () =>
        {
            const res = await fetch("/api/guestbook/count", { credentials: "include" });
            if (!res.ok) throw new Error("count API 실패");

            const data = await res.json().catch(() => ({}));
            return Number(data.count ?? 0);
        },

        fetchPage: async (page, size) =>
        {
            const p = Number(page) || 1;

            const res = await fetch(`/api/guestbook/list?page=${p}`, { credentials: "include" });
            if (!res.ok) throw new Error("list API 실패");

            const data = await res.json();
            if (!Array.isArray(data)) throw new Error("list API 응답이 배열이 아님");
            return data;
        },

        renderItems: (list) => { renderGuestbook(list); }
    });

    paginator.init().catch(e =>
    {
        console.error(e);
        showToast("방명록을 불러오지 못했습니다.");
    });
});