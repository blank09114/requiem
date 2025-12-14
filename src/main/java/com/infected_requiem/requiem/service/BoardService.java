package com.infected_requiem.requiem.service;

import com.infected_requiem.requiem.dto.log.PostDTO;
import com.infected_requiem.requiem.repository.BoardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService
{
    private final BoardMapper boardMapper;
    private static final int PAGE_SIZE = 10;

    // 카운팅
    public int count(Integer tagId) { return boardMapper.countPost(tagId); }

    // 페이지 조회
    public List<PostDTO> getPage(int page, Integer tagId)
    {
        int safePage = Math.max(1, page);
        int offset = (safePage - 1) * PAGE_SIZE;
        return boardMapper.findPage(PAGE_SIZE, offset, tagId);
    }

    // 게시글 등록
    public int createPost(PostDTO dto)
    {
        String title = dto.getPostTitle() == null ? "" : dto.getPostTitle().trim();
        String content = dto.getPostContent() == null ? "" : dto.getPostContent().trim();

        if (dto.getTagId() == null) throw new IllegalArgumentException("카테고리가 필요합니다.");
        if (title.isEmpty()) throw new IllegalArgumentException("제목을 입력해주세요.");
        if (content.isEmpty()) throw new IllegalArgumentException("내용을 입력해주세요.");

        dto.setPostTitle(title);
        dto.setPostContent(content);

        boardMapper.insertPost(dto);

        if (dto.getPostId() == null) throw new IllegalStateException("게시글 ID 생성에 실패했습니다.");

        return dto.getPostId();
    }

    // 게시글 단일 조회
    public PostDTO getPost(int postId)
    {
        PostDTO post = boardMapper.findById(postId);
        if (post == null) throw new IllegalStateException("존재하지 않는 게시글입니다.");
        return post;
    }

    // 게시글 수정
    public void updatePost(PostDTO dto)
    {
        if (dto.getPostId() == null) throw new IllegalArgumentException("게시글 ID가 필요합니다.");

        PostDTO existingPost = boardMapper.findById(dto.getPostId());
        if (existingPost == null) throw new IllegalStateException("존재하지 않는 게시글입니다.");

        String title = dto.getPostTitle() == null ? "" : dto.getPostTitle().trim();
        String content = dto.getPostContent() == null ? "" : dto.getPostContent().trim();

        if (dto.getTagId() == null) throw new IllegalArgumentException("카테고리가 필요합니다.");
        if (title.isEmpty()) throw new IllegalArgumentException("제목을 입력해주세요.");
        if (content.isEmpty()) throw new IllegalArgumentException("내용을 입력해주세요.");

        dto.setPostTitle(title);
        dto.setPostContent(content);

        boardMapper.updatePost(dto);
    }

    // 게시글 삭제
    public void deletePost(int postId)
    {
        PostDTO existingPost = boardMapper.findById(postId);
        if (existingPost == null) throw new IllegalStateException("존재하지 않는 게시글입니다.");

        int deleted = boardMapper.deleteById(postId);
        if (deleted == 0) throw new IllegalStateException("게시글 삭제에 실패했습니다.");
    }
}