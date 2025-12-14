// 스크롤
function scrollMov(direction)
{
    if (direction === 'top')
    { window.scrollTo({ top: 0, behavior: 'smooth'}); }
    else if (direction === 'bottom')
    { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }
    else { console.warn("scrollMov: direction값이 잘못되었습니다.", direction); }
}

// 토스트 전역 변수
let toastTimer = null;
let isClosing = false;

// 토스트 알림
function showToast(message)
{
    const content = document.querySelector('.toastContent');
    const messageSpan = content.querySelector('.text3');

    if (!content || !messageSpan) return;
    if (isClosing) { setTimeout(() => showToast(message), 120); return; }
    if (content.style.transform === "translateX(0)")
    { closeToast(() => showToast(message)); return; }

    messageSpan.textContent = message;
    content.style.transition = "transform 0.1s ease";
    content.style.transform = "translateX(0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => closeToast(), 5000);
}

// 토스트 제거
function closeToast(callback)
{
    const content = document.querySelector('.toastContent');
    if (!content) return;

    isClosing = true;

    content.style.transition = "transform 0.1s ease";
    content.style.transform = "translateX(300px)";

    content.addEventListener('transitionend', function handler()
    {
        content.removeEventListener('transitionend', handler);
        isClosing = false;

        if (callback) callback();
    });
}

// 음악 재생
document.addEventListener('DOMContentLoaded', () =>
{
    const audio = document.getElementById('bgmAudio');
    const playBtn = document.querySelector('.playBtn');
    const progressWrap = document.querySelector('.playProgressWrap');
    const progressBar = document.querySelector('.playProgress');
    const timeText = document.getElementById('bgmTime');

    if (!audio || !playBtn || !progressWrap || !progressBar || !timeText) return;

    const STORAGE_KEY = 'bgmState';
    const STORAGE = sessionStorage;

    let pendingSeekTime = null;
    let wantAutoResume = false;
    let firstInteractionBound = false;

    function formatTime(sec)
    {
        if (!isFinite(sec) || isNaN(sec)) sec = 0;
        sec = Math.floor(sec);
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    function updatePlayButton() { playBtn.textContent = audio.paused ? '▶' : '■'; }

    function updateTimeAndProgress()
    {
        const current = audio.currentTime || 0;
        const duration = audio.duration;

        const left = formatTime(current);
        const right = isFinite(duration) && !isNaN(duration) ? formatTime(duration) : '00:00';
        timeText.textContent = `${left} / ${right}`;

        if (isFinite(duration) && !isNaN(duration) && duration > 0)
            progressBar.style.width = (current / duration * 100) + '%';
        else
            progressBar.style.width = '0%';
    }

    function saveState()
    {
        const state = { currentTime: audio.currentTime, playing: !audio.paused };
        try { STORAGE.setItem(STORAGE_KEY, JSON.stringify(state)); }
        catch (e) { console.warn('saveState error:', e); }
    }

    function loadState()
    {
        let raw;
        try { raw = STORAGE.getItem(STORAGE_KEY); }
        catch (e) { console.warn('loadState error:', e); return; }
        if (!raw) return;

        try
        {
            const state = JSON.parse(raw);
            if (typeof state.currentTime === 'number') pendingSeekTime = state.currentTime;
            if (state.playing) wantAutoResume = true;
        }
        catch (e) { console.error(e); }
    }

    function applyPendingSeekIfPossible()
    {
        if (pendingSeekTime == null) return;

        const duration = audio.duration;
        if (!isFinite(duration) || isNaN(duration) || duration <= 0) return;

        const target = Math.max(0, Math.min(pendingSeekTime, duration - 0.1));
        try { audio.currentTime = target; pendingSeekTime = null; }
        catch (e) { console.warn('applyPendingSeek failed:', e); }
    }

    function bindFirstInteractionForResume()
    {
        if (!wantAutoResume || firstInteractionBound) return;
        firstInteractionBound = true;

        const resume = () =>
        {
            applyPendingSeekIfPossible();
            audio.play()
            .then(() => { updatePlayButton(); updateTimeAndProgress(); saveState(); })
            .catch(err => { console.warn('auto resume play failed:', err); })
            .finally(() =>
            {
                document.removeEventListener('click', resume);
                document.removeEventListener('touchstart', resume);
            });
        };

        document.addEventListener('click', resume);
        document.addEventListener('touchstart', resume);
    }

    function tryAutoResume()
    {
        if (!wantAutoResume) return;

        applyPendingSeekIfPossible();

        audio.play().then(() =>
        {
            wantAutoResume = false;
            updatePlayButton();
            updateTimeAndProgress();
            saveState();
        }).catch(err =>
        {
            console.warn('auto resume blocked, fallback to first interaction', err);
            bindFirstInteractionForResume();
        });
    }

    // 버튼 이벤트
    playBtn.addEventListener('click', () =>
    {
        if (audio.paused)
        {
            applyPendingSeekIfPossible();
            audio.play()
            .then(() => { updatePlayButton(); updateTimeAndProgress(); saveState(); })
            .catch(err => { console.error('play failed:', err); });
        }
        else
        {
            audio.pause();
            updatePlayButton();
            saveState();
        }
    });

    audio.addEventListener('loadedmetadata', () =>
    {
        applyPendingSeekIfPossible();
        updateTimeAndProgress();
        tryAutoResume();
    });

    audio.addEventListener('timeupdate', () => { updateTimeAndProgress(); saveState(); });
    audio.addEventListener('play', () => { updatePlayButton(); saveState(); });
    audio.addEventListener('pause', () => { updatePlayButton(); saveState(); });
    audio.addEventListener('ended', () => { updateTimeAndProgress(); saveState(); });

    function seekByClientX(clientX)
    {
        const rect = progressWrap.getBoundingClientRect();
        const ratio = (clientX - rect.left) / rect.width;

        const duration = audio.duration;
        if (!isFinite(duration) || isNaN(duration) || duration <= 0) return;

        const targetTime = Math.max(0, Math.min(duration * ratio, duration - 0.1));
        try { audio.currentTime = targetTime; updateTimeAndProgress(); saveState(); }
        catch (e) { console.warn('seek failed:', e); }
    }

    progressWrap.addEventListener('click', (e) => seekByClientX(e.clientX));
    progressWrap.addEventListener('touchstart', (e) =>
    {
        const touch = e.touches[0];
        if (!touch) return;
        seekByClientX(touch.clientX);
    });

    // 전역 이벤트 바인딩
    window.addEventListener('beforeunload', saveState);
    window.addEventListener('pagehide', (e) => { if (e.persisted) return; saveState(); });

    // 초기화
    loadState();
    updatePlayButton();
    updateTimeAndProgress();
    tryAutoResume();
});

// 로그아웃
async function logout()
{
    try
    {
        const res = await fetch('/api/users/logout', { method: 'POST', headers: { 'Accept': 'application/json' } });

        if (!res.ok) { showToast('로그아웃에 실패했습니다.'); return; }

        location.href = '/main';
    }
    catch (e) { console.error(e); showToast('서버 연결에 실패했습니다.'); }
}