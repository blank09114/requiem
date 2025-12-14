package com.infected_requiem.requiem.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.infected_requiem.requiem.dto.GeustbookDTO;
import com.infected_requiem.requiem.repository.GuestbookMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GuestbookService
{
    private final GuestbookMapper guestbookMapper;

    private static final int PAGE_SIZE = 5;

    // 신규 방명록 등록
    public void insertGuestbook(GeustbookDTO dto)
    {
        if (guestbookMapper.isUserBlocked(dto.getUserId())) throw new IllegalStateException("차단된 사용자입니다.");
        guestbookMapper.insertGuestbook(dto);
    }

    // 카운팅
    public int count() { return guestbookMapper.countGuestbook(); }

    // 페이지 조회
    public List<GeustbookDTO> getPage(int page)
    {
        int safePage = Math.max(1, page);
        int offset = (safePage - 1) * PAGE_SIZE;
        return guestbookMapper.selectGuestbookPage(PAGE_SIZE, offset);
    }

    // 답변 등록
    public void answer(GeustbookDTO dto)
    {
        int updated = guestbookMapper.updateGuestbookAnswer(dto);
        if (updated == 0) throw new IllegalStateException("이미 답변이 등록됐거나 존재하지 않는 방명록입니다.");
    }

    // 답변 삭제
    public void deleteAnswer(int guestbookId)
    {
        int updated = guestbookMapper.deleteGuestbookAnswer(guestbookId);
        if (updated == 0) throw new IllegalStateException("삭제할 답변이 없거나 존재하지 않는 방명록입니다.");
    }

    // 유저 차단
    @Transactional
    public Map<String, Object> blockUserAndDeleteAllGuestbooks(int guestbookId)
    {
        String userId = guestbookMapper.selectUserIdByGuestbookId(guestbookId);
        if (userId == null || userId.isBlank()) throw new IllegalStateException("존재하지 않는 방명록입니다.");

        int blocked = guestbookMapper.blockUserByUserId(userId);
        int deletedCount = guestbookMapper.deleteGuestbooksByUserId(userId);

        return Map.of("userId", userId, "blocked", blocked > 0, "deletedCount", deletedCount);
    }
}