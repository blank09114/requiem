package com.infected_requiem.requiem.repository;

import java.util.List;

import com.infected_requiem.requiem.dto.GeustbookDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface GuestbookMapper
{
    // 신규 방명록 등록
    int insertGuestbook(GeustbookDTO dto);

    // 차단 여부 조회
    boolean isUserBlocked(@Param("userId") String userId);

    // 카운팅
    int countGuestbook();

    // 페이지 조회
    List<GeustbookDTO> selectGuestbookPage(@Param("limit") int limit, @Param("offset") int offset);

    // 답변 등록
    int updateGuestbookAnswer(GeustbookDTO dto);

    // 답변 삭제
    int deleteGuestbookAnswer(@Param("guestbookId") int guestbookId);

    // 방명록 작성자 조회
    String selectUserIdByGuestbookId(@Param("guestbookId") int guestbookId);

    // 유저 차단
    int blockUserByUserId(@Param("userId") String userId);

    // 해당 유저가 작성한 방명록 전체 삭제
    int deleteGuestbooksByUserId(@Param("userId") String userId);
}