// 공용 유틸
function escapeHtml(str)
{ return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// 프로필 열람
function removeBlind()
{
    const blind = document.querySelector('.blind');
    if (blind) blind.style.display = 'none';
}

// 목차 생성+이동
function buildProfileIndex()
{
    const profile = document.querySelector('.profile');
    const indexBox = document.querySelector('.index');
    if (!profile || !indexBox) return;

    indexBox.querySelectorAll('p.text2').forEach(p => p.remove());

    const headings = profile.querySelectorAll('p.title1Text, p.title2Text, p.text1');

    headings.forEach((headingEl, i) =>
    {
        const indexEl = headingEl.querySelector('.indexBtn');
        if (!indexEl) return;

        const num = (indexEl.textContent || '').trim();
        const title = getHeadingText(headingEl).trim();
        if (!title) return;

        const depth = (num.match(/\./g) || []).length;

        const anchorId = `profile_h_${i}`;
        const tocId = `toc_h_${i}`;
        headingEl.id = anchorId;

        const p = document.createElement('p');
        p.className = 'text2';
        p.id = tocId;

        if (depth === 2) p.classList.add('in1');
        if (depth === 3) p.classList.add('in2');

        p.innerHTML = `<a class="indexBtn">${escapeHtml(num)}</a> ${escapeHtml(title)}`;
        p.style.cursor = 'pointer';

        p.addEventListener('click', () =>
        { document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

        headingEl.style.cursor = 'pointer';
        headingEl.addEventListener('click', () =>
        { document.getElementById(tocId)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); });

        indexBox.appendChild(p);
    });
}

// 제목 텍스트 추출
function getHeadingText(el)
{
    const clone = el.cloneNode(true);
    const idx = clone.querySelector('.indexBtn');
    if (idx) idx.remove();
    return clone.textContent || '';
}

// 요소 정의
const elementTypes =
{
    title1: { tag: 'input', type: 'text', name: 'title1Form', placeholder: '제목 1' },
    title2: { tag: 'input', type: 'text', name: 'title2Form', placeholder: '제목 2' },
    title3: { tag: 'input', type: 'text', name: 'title3Form', placeholder: '제목 3' },
    text: { tag: 'textarea', name: 'textForm', placeholder: '본문' }
};

// 요소 추가
function addElement(type)
{
    const config = elementTypes[type];
    if (!config) return;

    const editForm = document.querySelector('form.edit');
    const btnsWrap = document.querySelector('.btnsWrap');
    if (!editForm || !btnsWrap) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'elementWrap';

    const field = document.createElement(config.tag);
    field.name = config.name;
    field.placeholder = config.placeholder;
    if (config.type) field.type = config.type;

    if (config.tag === 'input') field.classList.add('titleForm');
    if (config.tag === 'textarea') field.classList.add('editor');

    wrapper.appendChild(field);
    wrapper.appendChild(createBtns());

    editForm.insertBefore(wrapper, btnsWrap);

    if (config.tag === 'textarea') EditorUtil.initEditor(field);
}

// 버튼 생성
function createBtns()
{
    const wrap = document.createElement('div');
    wrap.className = 'elementBtnsWrap';

    [{ t: '↑', a: 'up' }, { t: '↓', a: 'down' }, { t: '×', a: 'delete' }].forEach(b =>
    {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'elementBtn';
        btn.textContent = b.t;

        btn.onclick = () => { if (b.a === 'delete') deleteElement(btn); else movElement(btn, b.a); };

        wrap.appendChild(btn);
    });

    return wrap;
}

// 요소 이동
function movElement(button, dir)
{
    const wrapper = button.closest('.elementWrap');
    if (!wrapper) return;

    const editForm = document.querySelector('form.edit');
    if (!editForm) return;

    const textarea = wrapper.querySelector('textarea.editor');

    let cached = null;
    if (textarea) cached = EditorUtil.destroyEditor(textarea);

    if (dir === 'up')
    {
        const prev = wrapper.previousElementSibling;
        if (prev && !prev.classList.contains('btnsWrap')) editForm.insertBefore(wrapper, prev);
    }
    else
    {
        const next = wrapper.nextElementSibling;
        if (next && !next.classList.contains('btnsWrap')) editForm.insertBefore(wrapper, next.nextSibling);
    }

    if (textarea)
    {
        EditorUtil.initEditor(textarea);
        if (cached !== null) EditorUtil.setEditorContentWhenReady(textarea, cached);
    }
}

// 요소 삭제
function deleteElement(button)
{
    const wrapper = button.closest('.elementWrap');
    if (!wrapper) return;

    const textarea = wrapper.querySelector('textarea.editor');
    if (textarea) EditorUtil.destroyEditor(textarea);

    wrapper.remove();
}

// 데이터 라벨링
function buildProfileContent()
{
    let h1 = 0, h2 = 0, h3 = 0;
    let html = '';

    document.querySelectorAll('form.edit .elementWrap').forEach(w => {
    const t1 = w.querySelector('input[name="title1Form"]');
    const t2 = w.querySelector('input[name="title2Form"]');
    const t3 = w.querySelector('input[name="title3Form"]');
    const tx = w.querySelector('textarea[name="textForm"]');

    if (t1)
    {
        h1++; h2 = 0; h3 = 0;
        html += `<p class="title1Text left"><a class="indexBtn">${h1}.</a> ${escapeHtml(t1.value)}</p>`;
    }
    else if (t2)
    {
        h2++; h3 = 0;
        html += `<p class="title2Text left"><a class="indexBtn">${h1}.${h2}.</a> ${escapeHtml(t2.value)}</p>`;
    }
    else if (t3)
    {
        h3++;
        html += `<p class="text1 left"><a class="indexBtn">${h1}.${h2}.${h3}.</a> ${escapeHtml(t3.value)}</p>`;
    }
    else if (tx)
    {
    let content = tx.value;
        if (typeof tinymce !== 'undefined')
        {
            const ed = tinymce.get(tx.id);
            if (ed) content = ed.getContent();
        }
        html += `<div class="profileText">${content}</div>`;
    }
    });

    return html;
}

function beforeSubmit()
{
    if (typeof tinymce !== 'undefined') tinymce.triggerSave();
    const hidden = document.getElementById('profileContent');
    if (hidden) hidden.value = buildProfileContent();
    return true;
}

// 기존 데이터 불러오기
function loadProfileForEditFromHiddenDiv()
{
    const raw = document.getElementById('profileRaw');
    if (!raw) return;

    const html = raw.innerHTML.trim();
    if (!html) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    Array.from(doc.body.children).forEach(node =>
    {
        if (node.matches('p.title1Text'))
        {
            addElement('title1');
            const inputs = document.querySelectorAll('input[name="title1Form"]');
            inputs[inputs.length - 1].value = extractTitleText(node);
        }
        else if (node.matches('p.title2Text'))
        {
            addElement('title2');
            const inputs = document.querySelectorAll('input[name="title2Form"]');
            inputs[inputs.length - 1].value = extractTitleText(node);
        }
        else if (node.matches('p.text1'))
        {
            addElement('title3');
            const inputs = document.querySelectorAll('input[name="title3Form"]');
            inputs[inputs.length - 1].value = extractTitleText(node);
        }
        else if (node.matches('div.profileText'))
        {
            addElement('text');

            const textareas = document.querySelectorAll('textarea[name="textForm"]');
            const textarea = textareas[textareas.length - 1];

            const contentHtml = node.innerHTML;
            textarea.value = contentHtml;

            EditorUtil.initEditor(textarea);
            EditorUtil.setEditorContentWhenReady(textarea, contentHtml);
        }
    });
}

// 제목 추출
function extractTitleText(el)
{
    const clone = el.cloneNode(true);
    const idx = clone.querySelector('.indexBtn');
    if (idx) idx.remove();
    return (clone.textContent || '').trim();
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () =>
{
    if (document.querySelector('.profile') && document.querySelector('.index')) buildProfileIndex();
    if (document.querySelector('form.edit')) loadProfileForEditFromHiddenDiv();
});