let paginator = null;

// 이미지 등록 폼 토글
function toggleImgform()
{
    const form = document.getElementById("imgForm");
    if (!form) return;

    form.style.display = (form.style.display === "none" || form.style.display === "") ? "flex" : "none";
}

// 이미지 파일 업로드
async function uploadImage(file)
{
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/img/upload",
    {
        method: "POST",
        body: formData
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "이미지 업로드 실패");

    return json.location;
}

// 갤러리 메타 저장
async function saveGalleryMeta({ imgUrl, imgName, imgArtist })
{
    const res = await fetch("/api/gallery/upload",
    {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imgUrl, imgName, imgArtist })
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "갤러리 등록 실패");

    return json;
}

// 이미지 등록
async function addImg()
{
    const titleInput = document.getElementById("title");
    const artistInput = document.getElementById("artist");
    const imgInput = document.getElementById("img");

    const title = titleInput?.value?.trim() ?? "";
    const artist = artistInput?.value?.trim() ?? "";

    if (title === "")
    { showToast("이미지 제목을 입력하세요."); titleInput?.focus(); return; }
    if (artist === "")
    { showToast("작가 이름을 입력하세요."); artistInput?.focus(); return; }
    if (!imgInput || !imgInput.files || imgInput.files.length === 0)
    { showToast("선택된 파일이 없습니다."); return; }

    const file = imgInput.files[0];

    try
    {
        const imgUrl = await uploadImage(file);

        await saveGalleryMeta({
            imgUrl,
            imgName: title,
            imgArtist: artist
        });

        titleInput.value = "";
        artistInput.value = "";
        imgInput.value = "";

        showToast("이미지 등록 완료!");

        if (paginator) await paginator.go(1);
    }
    catch (e)
    {
        console.error(e);
        showToast(e.message || "오류가 발생했습니다.");
    }
}

// 렌더링
function renderGallery(list)
{
    const pictureList = document.querySelector(".pictureList");
    if (!pictureList) return;

    pictureList.innerHTML = "";

    if (!Array.isArray(list)) return;

    list.forEach(item => { pictureList.appendChild(createPictureItem(item)); });
}

// UI 생성
function createPictureItem(item)
{
    const btn = document.createElement("button");
    btn.className = "pictureItem";
    btn.type = "button";
    btn.dataset.imgId = item.imgId;
    btn.onclick = () => imgEnlargement(btn);

    const img = document.createElement("img");
    img.className = "picture";
    img.src = item.imgUrl;

    const info = document.createElement("div");
    info.className = "pictureInfo";

    const t1 = document.createElement("span");
    t1.className = "text1";
    t1.textContent = item.imgName;

    const t2 = document.createElement("span");
    t2.className = "text2";
    t2.textContent = `${item.imgArtist} - ${formatDate(item.imgDate)}.`;

    info.appendChild(t1);
    info.appendChild(t2);

    btn.appendChild(img);
    btn.appendChild(info);

    if (window.IS_ADMIN)
    {
        const del = document.createElement("div");
        del.className = "btn red";
        del.textContent = "삭제";
        del.onclick = (e) => { e.stopPropagation(); deletePicture(btn); };
        btn.appendChild(del);
    }

    return btn;
}

function formatDate(iso)
{
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "yyyy.mm.dd";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
}

// 이미지 삭제
async function deletePicture(pictureItem)
{
    const titleEl = pictureItem?.querySelector(".pictureInfo .text1");
    const title = titleEl ? titleEl.textContent.trim() : "해당";
    const ok = confirm(`'${title}' 이미지를 삭제하시겠습니까?`);
    if (!ok) return;

    const imgId = Number(pictureItem?.dataset?.imgId);
    if (!imgId) { showToast("imgId가 없습니다."); return; }

    try
    {
        const res = await fetch(`/api/gallery/delete/${imgId}`, { method: "DELETE" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "삭제 실패");

        showToast("삭제 완료!");
        if (paginator) await paginator.go(1);
        else pictureItem.remove();
    }
    catch (e)
    {
        console.error(e);
        showToast(e.message || "오류가 발생했습니다.");
    }
}

// 이미지 확대
function imgEnlargement(pictureItem)
{
    const img = pictureItem.querySelector(".picture");
    const modal = document.querySelector(".modalOverlay");
    const modalImg = modal?.querySelector(".imgModal");

    if (!img || !modal || !modalImg) return;

    modalImg.src = img.src;
    modal.style.display = "flex";
}

// 모달 닫기
function closeModal()
{
    const modal = document.querySelector(".modalOverlay");
    const modalImg = modal?.querySelector(".imgModal");

    if (!modal || !modalImg) return;

    modal.style.display = "none";
    modalImg.src = "";
}

// 페이징 초기화
document.addEventListener("DOMContentLoaded", () =>
{
    paginator = createPaginator({
        containerSelector: ".pages",
        pageSize: 10,
        windowSize: 2,

        fetchCount: async () =>
        {
            const res = await fetch("/api/gallery/count");
            if (!res.ok) throw new Error("count API 실패");

            const data = await res.json().catch(() => ({}));
            return Number(data.count ?? data.cnt ?? data.totalCount ?? 0);
        },

        fetchPage: async (page, size) =>
        {
            const p = Number(page) || 1;

            const res = await fetch(`/api/gallery/list?page=${p}`);
            if (!res.ok) throw new Error("list API 실패");

            const data = await res.json();
            if (!Array.isArray(data)) throw new Error("list API 응답이 배열이 아님");
            return data;
        },

        renderItems: (list) => { renderGallery(list); }
    });

    paginator.init();
});