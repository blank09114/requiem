// 로그인
async function login()
{
    const idInput = document.getElementById('idInput');
    const id = idInput.value.trim();
    const pwInput = document.getElementById('pwInput');
    const pw = pwInput.value.trim();

    if (id === "")
    {
        idInput.focus();
        showToast('ID를 입력하세요.');
        return;
    }
    if (pw === "")
    {
        pwInput.focus();
        showToast('PW를 입력하세요.');
        return;
    }

    try
    {
        const res = await fetch('/api/users/login',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ userId: id, userPw: pw })
        });

        if (!res.ok) { showToast('로그인에 실패했습니다.'); return; }

        const data = await res.json(); // { success: true/false }

        if (data && data.success) { window.location.href = '/main'; }
        else { showToast('ID 또는 PW가 올바르지 않습니다.'); }
    }
    catch (e)
    {
        console.error(e);
        showToast('서버 연결에 실패했습니다.');
    }
}

// 닉네임 입력 검증
function nameCheck()
{
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();

    if(name === "")
    {
        showToast('닉네임을 입력하세요.');
        nameInput.focus();
        return false;
    }

    if(name.length < 2 || name.length > 10)
    {
        showToast('닉네임 형식이 올바르지 않습니다.');
        nameInput.focus();
        return false;
    }
    
    return true;
}

// id 입력 검증
function idCheck()
{
    const idInput = document.getElementById('idInput');
    const id = idInput.value.trim();
    const idRegex = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;

    if(id === "")
    {
        showToast('ID를 입력하세요.');
        idInput.focus();
        return false;
    }

    if(!idRegex.test(id))
    {
        showToast('ID 형식이 올바르지 않습니다.');
        idInput.focus();
        return false;
    }

    return true;
}

// id 중복 확인
async function idUsingCheck()
{
    if(!idCheck()) return;

    const id = document.getElementById('idInput').value.trim();
    const okText = document.querySelector('.okText');
    const noText = document.querySelector('.noText');

    okText.style.display = 'none';
    noText.style.display = 'none';

    try
    {
        const res = await fetch(`/api/users/exists?userId=${encodeURIComponent(id)}`,
        { method: 'GET', headers: { 'Accept': 'application/json' } });

        if(!res.ok) { showToast('중복 확인에 실패했습니다.'); return; }

        const data = await res.json();

        if(data.exists) noText.style.display = 'block';
        else okText.style.display = 'block';

    }
    catch (e)
    {
        console.error(e);
        showToast('서버 연결에 실패했습니다.');
    }
}

// id 중복 확인 여부 확인
function isIdUsingCheck()
{
    const id = document.getElementById('idInput');
    const okText = document.querySelector('.okText');
    const noText = document.querySelector('.noText');

    if (okText.style.display === 'block') { return true; }
    if (noText.style.display === 'block') 
    {
        showToast('ID를 변경하세요.');
        id.focus();
        return false;
    }

    // 중복 확인 안 함
    showToast('ID 중복 확인을 해주세요.');
    return false;
}

// ID 중복 확인 상태 초기화
function resetIdCheck()
{
    const okText = document.querySelector('.okText');
    const noText = document.querySelector('.noText');

    if(okText) okText.style.display = 'none';
    if(noText) noText.style.display = 'none';
}

// pw 확인
function pwCheck()
{
    const pwInput = document.getElementById('pwInput');
    const pw = pwInput.value.trim();
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,40}$/;

    if(pw === "")
    {
        showToast('PW를 입력하세요.');
        pwInput.focus();
        return false;
    }

    if(!pwRegex.test(pw))
    {
        showToast('PW 형식이 올바르지 않습니다.');
        pwInput.focus();
        return false;
    }

    return true;
}

// pw 일치 여부 확인
function pwAgreementCheck()
{
    const pw = document.getElementById('pwInput').value.trim();
    const pwCheckInput = document.getElementById('pwCheckInput');
    const pwCheck = pwCheckInput.value.trim();

    if(pw != pwCheck)
    {
        showToast('PW가 일치하지 않습니다.');
        pwCheckInput.focus();
        return false;
    }

    return true;
}

// 개인정보 처리방침 동의 여부 확인
function agreeCheck()
{
    const agree = document.getElementById('agree');

    if(!agree.checked)
    {
        showToast('개인정보 처리방침에 동의해주세요.');
        agree.focus();
        return false;
    }

    return true;
}

// 회원가입
async function join()
{
    // 검증
    if(!nameCheck()) return;
    if(!idCheck()) return;
    if(!isIdUsingCheck()) return;
    if(!pwCheck()) return;
    if(!pwAgreementCheck()) return;
    if(!agreeCheck()) return;

    const userName = document.getElementById('nameInput').value.trim();
    const userId = document.getElementById('idInput').value.trim();
    const userPw = document.getElementById('pwInput').value.trim();

    try
    {
        const res = await fetch('/api/users/signup',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ userId, userPw, userName })
        });

        if(!res.ok)
        {
            let msg = '회원가입에 실패했습니다.';
            try { const err = await res.json(); if(err && err.message) msg = err.message; }
            catch (_) {}
            showToast(msg);
            return;
        }

        showToast('회원가입 완료!');
    }
    catch (e) { console.error(e); showToast('서버 연결에 실패했습니다.'); }
}