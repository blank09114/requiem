package com.infected_requiem.requiem.repository;

import com.infected_requiem.requiem.dto.log.PostDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardMapper
{
    // 게시글 목록 조회
    List<PostDTO> findPage(@Param("limit") int limit, @Param("offset") int offset, @Param("tagId") Integer tagId);

    // 카운팅
    int countPost(@Param("tagId") Integer tagId);

    // 게시글 등록
    void insertPost(PostDTO dto);

    // 게시글 단일 조회
    PostDTO findById(@Param("postId") int postId);

    // 게시글 수정
    void updatePost(PostDTO dto);

    // 게시글 삭제
    int deleteById(@Param("postId") int postId);
}
