(function (global)
{
    'use strict';
    function ensureId(el)
    {
        if (!el.id) el.id = 'mce_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
        return el.id;
    }

    function defaultTinyOptions(target, opt)
    {
        const uploadUrl = (opt && opt.uploadUrl) ? opt.uploadUrl : '/api/img/upload';

        return {
            target, language: (opt && opt.language) || 'ko_KR',
            menubar: (opt && typeof opt.menubar === 'boolean') ? opt.menubar : false,
            height: (opt && opt.height) || 300, skin: (opt && opt.skin) || 'oxide-dark',
            plugins: (opt && opt.plugins) ||
            [
                'table', 'lists', 'link', 'image',
                'autolink', 'charmap', 'help', 'color'
            ],
            toolbar: (opt && opt.toolbar) ||
            (
                'undo redo | bold italic underline | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'fontsize forecolor backcolor | ' +
                'bullist numlist | table | image | link'
            ),
            font_size_formats: (opt && opt.fontSizeFormats) || '12px 14px 16px 18px 24px 36px',
            images_upload_handler: (blobInfo /*, progress */) =>
            {
                const formData = new FormData();
                formData.append('file', blobInfo.blob(), blobInfo.filename());

                return fetch(uploadUrl,
                { method: 'POST', body: formData, credentials: (opt && opt.credentials) || 'include' })
                .then(res => res.json()).then(json =>
                {
                    if (json.location) return json.location;
                    throw new Error(json.message || '이미지 업로드 실패');
                });
            },

            automatic_uploads: true,
            file_picker_types: 'image',
            images_upload_credentials: true,

            content_style: (opt && opt.contentStyle) || `
                body
                {
                    background-color: #111113;
                    color: #E7E7E7;
                    font-family: Pretendard, sans-serif;
                    font-size: 14px;
                }
                table { border-collapse: collapse; }
                table td, table th { border: 1px solid #8E8E95; }
                a { color: #7A4FA3; }
                img { max-width: 100%; height: auto; }
            `
        };
    }

    // 초기화
    function initEditor(textarea, opt)
    {
        if (typeof tinymce === 'undefined') return;
        if (!textarea) return;

        const id = ensureId(textarea);
        if (tinymce.get(id)) return;

        tinymce.init(defaultTinyOptions(textarea, opt));
    }

    // 제거
    function destroyEditor(textarea)
    {
        if (typeof tinymce === 'undefined') return null;
        if (!textarea || !textarea.id) return null;

        const ed = tinymce.get(textarea.id);
        if (!ed) return null;

        const cached = ed.getContent();
        ed.remove();
        textarea.value = cached;
        return cached;
    }

    // 세팅
    function setEditorContentWhenReady(textarea, html, retryMs = 30, maxTry = 100)
    {
        if (typeof tinymce === 'undefined' || !textarea || !textarea.id) return;

        let count = 0;
        const trySet = () =>
        {
            const ed = tinymce.get(textarea.id);
            if (ed) ed.setContent(html || '');
            else if (count++ < maxTry) setTimeout(trySet, retryMs);
        };
        trySet();
    }

    global.EditorUtil = { initEditor, destroyEditor, setEditorContentWhenReady };
})(window);