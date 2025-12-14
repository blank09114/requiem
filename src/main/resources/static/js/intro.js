(() =>
{
    // 스크립트
    const brightStepScripts =
    {
        1: [
            { text: "열매도 드셨으니… 수고하셨어요, 선생님!", button: "네", canClose: true },
            { text: "저, 혹시 정기 상담은 어떠신가요?", button: "아니오", canClose: true },
            { text: "요새 사람들은 바쁜 것 같네요….", button: "아니오", group: "step1_pair1" },
            { text: "하지만 약속을 잡고 꾸준히 방문하시면 분명 도움이 되실 거예요:)", button: "아니오", group: "step1_pair1", canClose: true },
            { text: "…….", button: "아니오", group: "step1_pair2" },
            { text: "…그러지 마시고 다시 생각해보세요.", button: "아니오", group: "step1_pair2", canClose: true, stopBgm1: true }
        ],
        2:
        [
            { text: "왜 거절하시는 거죠?", button: "아니오", group: "step2_triple1" },
            { text: "제가 이렇게 친절하게 말씀드렸잖아요.", button: "아니오", group: "step2_triple1" },
            { text: "거절하시면, 안 되죠.", button: "아니오", group: "step2_triple1", canClose: true, startBgm2: true }
        ]
    };
    const redStepScripts =
    [
        { text: "누나.", button: null },
        { text: "우리 상담을 받자.", button: null },
        { text: "여기라면 아프지 않아.", button: null },
        { text: "행복해질 수 있어.", button: null },
        { text: "상담 선생님이 정말 잘해주셔.", button: null },
        { text: "누나도 나랑 같이 있으면 좋을 것 같아.", button: "그래" },
        { text: "정말?", button: null },
        { text: "정말이지? 약속이야?", button: "약속할게" },
        { text: "…….", button: null, triggerLaugh: true },
        { text: "아아, 소율 님. 안쓰럽기도 하지.", button: "싫어" },
        { text: "제가 정말 잘 해드릴게요!", button: "싫어", finalTrigger: true }
    ];

    // 오디오
    let bgm1 = null; // music1.mp3
    let bgm2 = null; // music2.mp3

    function createBgm(src, loop = true)
    {
        const audio = new Audio(src);
        audio.loop = loop;
        return audio;
    }

    function playBgm(ref, src)
    {
        if (!ref.audio) { ref.audio = createBgm(src); }
        ref.audio.currentTime = 0;
        ref.audio.play();
    }

    function stopBgm(ref, resetTime = true)
    {
        if (!ref.audio) return;
        ref.audio.pause();
        if (resetTime) ref.audio.currentTime = 0;
    }

    const bgmRef1 = { audio: null };
    const bgmRef2 = { audio: null };

    // 상태 변수
    let currentBrightGroup = 1;
    let currentBrightIndex = 0;
    let redStarted = false;
    let currentRedIndex = 0;
    let laughStageStarted = false;
    let redStepScheduled = false;

    // DOM 헬퍼
    function $(id) { return document.getElementById(id); }

    function fadeInOverlay(overlay)
    {
        if (!overlay) return;

        overlay.style.display = "flex";
        overlay.dataset.state = "active";
        overlay.style.opacity = "0";

        requestAnimationFrame(() => { overlay.style.opacity = "1"; });
    }

    function fadeOutOverlay(overlay, callback)
    {
        if (!overlay) { if (callback) callback(); return; }

        overlay.style.opacity = "0";
        overlay.dataset.state = "";

        setTimeout(() => { overlay.style.display = "none"; if (callback) callback();  }, 400);
    }

    function transitionOverlay(fromId, toId, callback)
    {
        const from = $(fromId);
        const to = $(toId);

        fadeOutOverlay(from, () => { if (to) fadeInOverlay(to); if (callback) setTimeout(callback, 450); });
    }

    function createPopupFromTemplate(overlay, extraClass)
    {
        const template = overlay.querySelector(".messageBox");
        if (!template) return null;

        const clone = template.cloneNode(true);
        clone.classList.add("clone");
        if (extraClass) clone.classList.add(extraClass);

        clone.style.display = "flex";
        clone.style.opacity = "1";
        template.style.display = "none";

        return clone;
    }

    // 1~2단계
    function enterCounseling()
    {
        const doorScreen = $("doorScreen");

        const src1 = window.BGM_PATH_1 || "/file/intro/music1.mp3";
        playBgm(bgmRef1, src1);

        if (!doorScreen) { startFirstBrightGroup(); return; }

        doorScreen.style.opacity = "0";

        setTimeout(() => { doorScreen.style.display = "none"; startFirstBrightGroup(); }, 500);
    }

    function startFirstBrightGroup()
    {
        currentBrightGroup = 1;
        currentBrightIndex = 0;

        const step1 = $("step1");
        if (!step1) return;

        fadeInOverlay(step1);
        showBrightPopup();
    }

    function showBrightPopup()
    {
        const scripts = brightStepScripts[currentBrightGroup];
        const stepId = currentBrightGroup === 1 ? "step1" : "step2";
        const overlay = $(stepId);

        if (!overlay || !scripts) return;

        if (currentBrightIndex >= scripts.length)
        {
            if (currentBrightGroup === 1)
            {
                transitionOverlay("step1", "step2", () =>
                {
                    currentBrightGroup = 2;
                    currentBrightIndex = 0;
                    showBrightPopup();
                });
            }
            else { transitionOverlay("step2", "step3", startGlitchStep3); }
            return;
        }

        const { firstIndex, lastIndex, groupKey } = findGroupRange(scripts, currentBrightIndex);

        const vw = overlay.clientWidth || window.innerWidth;
        const vh = overlay.clientHeight || window.innerHeight;

        const isMobile = vw <= 768;
        const marginX = isMobile ? 12 : 40;
        const marginY = isMobile ? 12 : 40;
        const templateBox = overlay.querySelector(".messageBox");
        let realWidth = templateBox.offsetWidth;
        let realHeight = templateBox.offsetHeight;

        if (!realWidth || realWidth < 50) realWidth = Math.min(420, vw - marginX * 2);
        if (!realHeight || realHeight < 50) realHeight = Math.min(180, vh - marginY * 2);

        const boxLayout =
        { width: realWidth, height: realHeight, marginX, marginY, containerWidth: vw, containerHeight: vh };

        const groupSize = lastIndex - firstIndex + 1;
        const positions = computeNonOverlappingPositions(groupSize, boxLayout);

        for (let i = firstIndex; i <= lastIndex; i++)
        {
            const data = scripts[i];
            const delay = (i - firstIndex) * 250;

            setTimeout(() =>
            {
                spawnBrightPopup
                (
                    overlay, data, groupKey, positions[i - firstIndex],
                    () =>
                    {
                        const allGroupBoxes = overlay.querySelectorAll(`.messageBox.clone[data-group-key="${groupKey}"]`);
                        allGroupBoxes.forEach(b => b.remove());

                        currentBrightIndex = lastIndex + 1;
                        showBrightPopup();
                    }
                );
            }, delay);
        }
    }

    function findGroupRange(scripts, startIndex)
    {
        const firstData = scripts[startIndex];
        const groupKey = firstData.group || `single_${startIndex}`;

        let lastIndex = startIndex;
        while (lastIndex + 1 < scripts.length)
        {
            const nextData = scripts[lastIndex + 1];
            const nextGroupKey = nextData.group || `single_${lastIndex + 1}`;
            if (nextGroupKey !== groupKey) break;
            lastIndex++;
        }

        return { firstIndex: startIndex, lastIndex, groupKey };
    }

    function computeNonOverlappingPositions(count, layout)
    {
        const
        {
            width: boxWidth, height: boxHeight, marginX, marginY,
            containerWidth: vw, containerHeight: vh
        } = layout;

        const positions = [];
        const placedRects = [];

        const isMobile = vw <= 768;

        if (isMobile)
        {
            const xRange = Math.max(vw - boxWidth - marginX * 2, 0);
            const yRange = Math.max(vh - boxHeight - marginY * 2, 0);

            for (let i = 0; i < count; i++)
            {
                let left = marginX + Math.random() * xRange;
                let top  = marginY + Math.random() * yRange;

                positions.push({ left, top });
            }

            return positions;
        }

        function randomRect()
        {
            const maxAttempts = 50;
            let attempt = 0;

            while (attempt < maxAttempts)
            {
                attempt++;

                const xRange = Math.max(vw - boxWidth - marginX * 2, 0);
                const yRange = Math.max(vh - boxHeight - marginY * 2, 0);

                let left = marginX + Math.random() * xRange;
                let top  = marginY + Math.random() * yRange;

                const maxLeft = Math.max(vw - boxWidth - marginX, marginX);
                const maxTop  = Math.max(vh - boxHeight - marginY, marginY);

                left = clamp(left, marginX, maxLeft);
                top  = clamp(top,  marginY, maxTop);

                const rect = { left, top, right: left + boxWidth, bottom: top + boxHeight };

                if (!hasOverlap(rect, placedRects)) { placedRects.push(rect); return rect; }
            }

            const offsetIndex = placedRects.length;
            let left = marginX;
            let top  = marginY + offsetIndex * (boxHeight + 12);

            const maxLeft = Math.max(vw - boxWidth - marginX, marginX);
            const maxTop  = Math.max(vh - boxHeight - marginY, marginY);

            left = clamp(left, marginX, maxLeft);
            top  = clamp(top,  marginY, maxTop);

            const rect = { left, top, right: left + boxWidth, bottom: top + boxHeight };
            placedRects.push(rect);
            return rect;
        }

        for (let i = 0; i < count; i++)
        {
            const rect = randomRect();
            positions.push({ left: rect.left, top: rect.top });
        }

        return positions;
    }

    function hasOverlap(rect, others)
    {
        return others.some(r =>
        {
            const noOverlap = rect.right <= r.left || rect.left >= r.right || rect.bottom <= r.top || rect.top >= r.bottom;
            return !noOverlap;
        });
    }

    function clamp(value, min, max) { return Math.max(min, Math.min(value, max)); }

    function spawnBrightPopup(overlay, data, groupKey, rect, onCloseGroup)
    {
        const box = createPopupFromTemplate(overlay);
        if (!box) return;

        box.dataset.groupKey = groupKey;

        const msg = box.querySelector(".message");
        const btn = box.querySelector(".btn");

        if (msg) msg.textContent = data.text || "";

        if (btn)
        {
            if (data.canClose)
            {
                btn.textContent = data.button || "확인";

                btn.onclick = () =>
                {
                    if (data.stopBgm1) { stopBgm(bgmRef1, true); }
                    if (data.startBgm2)
                    {
                        stopBgm(bgmRef1, false);
                        const src2 = window.BGM_PATH_2 || "/file/intro/music2.mp3";
                        playBgm(bgmRef2, src2);
                    }

                    if (typeof onCloseGroup === "function") { onCloseGroup(); }
                };
            }
            else { btn.remove(); }
        }

        box.style.position = "absolute";
        overlay.appendChild(box); // ✅ 먼저 DOM에 붙여서 실제 크기 측정

        const vw = overlay.clientWidth || window.innerWidth;
        const vh = overlay.clientHeight || window.innerHeight;
        const isMobile = vw <= 768;

        if (isMobile)
        {
            const marginX = 12;
            const marginY = 12;

            // 실제 박스 크기
            const boxWidth  = box.offsetWidth  || 200;
            const boxHeight = box.offsetHeight || 120;

            const xRange = Math.max(vw - boxWidth - marginX * 2, 0);
            const yRange = Math.max(vh - boxHeight - marginY * 2, 0);

            const left = marginX + Math.random() * xRange;
            const top  = marginY + Math.random() * yRange;

            box.style.left = `${left}px`;
            box.style.top  = `${top}px`;
        }
        else
        {
            // PC는 기존처럼 rect 사용
            box.style.left = `${rect.left}px`;
            box.style.top  = `${rect.top}px`;
        }
    }

    // 3단계
    function startGlitchStep3()
    {
        const overlay = $("step3");
        if (!overlay) return;

        fadeInOverlay(overlay);

        const baseBox = overlay.querySelector(".messageBox");
        if (!baseBox) return;

        const count = 40;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = 420;
        const h = 180;

        const minX = -w * 0.3;
        const maxX = vw - w * 0.7;
        const minY = -h * 0.3;
        const maxY = vh - h * 0.7;

        for (let i = 0; i < count; i++)
        {
            const clone = baseBox.cloneNode(true);
            clone.classList.add("clone");

            const btn = clone.querySelector(".btn");
            if (btn) { btn.textContent = "아니오"; btn.onclick = goToRedStep; }

            const left = minX + Math.random() * (maxX - minX);
            const top  = minY + Math.random() * (maxY - minY);

            clone.style.left = `${left}px`;
            clone.style.top  = `${top}px`;
            clone.style.display = "flex";
            clone.style.opacity = "1";
            clone.style.animationDelay = `${i * 0.03}s`;

            overlay.appendChild(clone);
        }
        baseBox.style.display = "none";
    }

    function goToRedStep()
    {
        if (redStepScheduled) return;
        redStepScheduled = true;

        transitionOverlay("step3", "step4", startRedSequence);
    }

    // 4단계
    function startRedSequence()
    {
        if (redStarted) return;
        redStarted = true;

        currentRedIndex = 0;

        const overlay = $("step4");
        if (!overlay) return;

        fadeInOverlay(overlay);
        showRedPopup();
    }

    function showRedPopup()
    {
        const overlay = $("step4");
        if (!overlay) return;

        if (currentRedIndex >= redStepScripts.length) return;

        const data = redStepScripts[currentRedIndex];
        const box = createPopupFromTemplate(overlay, "redPopup");
        if (!box) return;

        const msg = box.querySelector(".message");
        const btn = box.querySelector(".btn");

        if (msg) msg.textContent = data.text || "";

        if (data.button)
        {
            if (btn)
            {
                btn.style.display = "block";
                btn.textContent = data.button;

                btn.onclick = () =>
                {
                    box.remove();

                    if (data.finalTrigger) { showFinalPromiseAndGoMain(); return; }

                    currentRedIndex += 1;
                    showRedPopup();
                };
            }
        }
        else
        {
            if (btn) btn.style.display = "none";

            const delay = data.triggerLaugh ? 1000 : 1200;

            setTimeout(() =>
            {
                box.remove();

                if (data.triggerLaugh) { startLaughStage(); } else { currentRedIndex += 1; showRedPopup(); }
            }, delay);
        }

        overlay.appendChild(box);
    }

    // 웃음
    function startLaughStage()
    {
        if (laughStageStarted) return;
        laughStageStarted = true;

        const overlay4 = $("step4");
        if (!overlay4) return;

        const laughTemplate = document.querySelector("#step5 .laughTemplate");
        if (!laughTemplate) { startFullScreenLaugh(); return; }

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const count = 25;
        const isMobile = vw <= 768;

        for (let i = 0; i < count; i++)
        {
            const clone = laughTemplate.cloneNode(true);
            clone.classList.add("clone", "laughPopup");
            clone.style.position = "absolute";

            let w, h = 180, left, top;

            if (isMobile)
            {
                w = vw * 1.4;
                left = (vw - w) / 2;
                clone.style.width = `${w}px`;
            }
            else { w = 420; left = Math.random() * (vw - w); }

            top = Math.random() * (vh - h);

            clone.style.left = `${left}px`;
            clone.style.top  = `${top}px`;
            clone.style.display = "flex";
            clone.style.opacity = "1";
            clone.style.animationDelay = `${i * 0.03}s`;

            overlay4.appendChild(clone);
        }

        setTimeout(() =>
        {
            const pops = overlay4.querySelectorAll(".laughPopup");
            pops.forEach(p => p.remove());

            startFullScreenLaugh();
        }, 1500);
    }

    function fillHahaText()
    {
        const overlay5 = $("step5");
        if (!overlay5) return;

        const hahaTextEl = overlay5.querySelector(".step5");
        if (!hahaTextEl) return;

        const baseLine = "하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하하";

        const vh = window.innerHeight;
        const fontPx = 10;
        const lineHeight = 1.1;
        const approxLines = Math.ceil(vh / (fontPx * lineHeight));
        const totalLines = approxLines * 6;

        let text = "";
        for (let i = 0; i < totalLines; i++) { text += baseLine + "\n"; }

        hahaTextEl.textContent = text;
    }

    function startFullScreenLaugh()
    {
        const overlay4 = $("step4");
        const overlay5 = $("step5");
        if (!overlay5) return;

        document.body.classList.add("flash");
        setTimeout(() => document.body.classList.remove("flash"), 350);

        transitionOverlay("step4", "step5", () =>
        {
            fillHahaText();

            const hahaText = overlay5.querySelector(".step5");
            if (hahaText) hahaText.classList.add("visible");

            setTimeout(() =>
            {
                const hahaText2 = overlay5.querySelector(".step5");
                if (hahaText2) hahaText2.classList.remove("visible");

                transitionOverlay("step5", "step4", () => { currentRedIndex += 1; showRedPopup(); });
            }, 2000);
        });
    }

    // 메인 페이지 이동
    function showFinalPromiseAndGoMain()
    {
        const overlay4 = $("step4");
        if (!overlay4) return;

        const oldClones = overlay4.querySelectorAll(".messageBox.clone");
        oldClones.forEach(c => c.remove());

        const template = overlay4.querySelector(".messageBox");
        if (!template) return;

        const box = template.cloneNode(true);
        box.classList.add("clone");

        const msg = box.querySelector(".message");
        const btn = box.querySelector(".btn");

        if (msg) msg.textContent = "이건 약속이니까요!";
        if (btn) btn.style.display = "none";

        box.style.display = "flex";
        box.style.opacity = "1";

        fadeInOverlay(overlay4);
        overlay4.appendChild(box);

        setTimeout(() => { const target = window.MAIN_URL || "/main"; window.location.href = target; }, 3000);
    }

    // inline closeStep 방어
    function closeStep(button)
    {
        if (!button) return;
        const box = button.closest(".messageBox");
        if (box && box.classList.contains("clone")) { box.remove(); }
    }

    // 페이지 로드
    window.onload = () =>
    {
        const doorScreen = $("doorScreen");

        if (doorScreen)
        {
            doorScreen.style.opacity = "0";
            setTimeout(() => { doorScreen.style.opacity = "1"; }, 10);
        }
        else { startFirstBrightGroup(); }
    };

    window.enterCounseling = enterCounseling;
    window.closeStep = closeStep;
})();