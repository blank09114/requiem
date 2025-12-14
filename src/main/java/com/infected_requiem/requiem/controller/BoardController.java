package com.infected_requiem.requiem.controller;

import com.infected_requiem.requiem.dto.log.PostDTO;
import com.infected_requiem.requiem.service.BoardService;
import com.infected_requiem.requiem.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
@RequestMapping("/board")
public class BoardController
{
    private final CategoryService categoryService;
    private final BoardService boardService;

    // 게시판
    @GetMapping("/")
    public String intro(Model model)
    {
        model.addAttribute("activeMenu", "board");
        model.addAttribute("categories", categoryService.getAllCategories());
        return "board/board";
    }

    // 게시글
    @GetMapping("/{postId}")
    public String post(@PathVariable int postId, Model model, RedirectAttributes ra)
    {
        try
        {
            model.addAttribute("post", boardService.getPost(postId));
            return "board/post";
        }
        catch (IllegalStateException e)
        {
            ra.addFlashAttribute("message", e.getMessage());
            return "redirect:/board/";
        }
    }

    // 게시글 작성 폼
    @GetMapping("/postForm")
    public String postForm(Model model)
    {
        model.addAttribute("categories", categoryService.getAllCategories());
        model.addAttribute("mode", "create");
        model.addAttribute("post", new PostDTO()); // 폼 바인딩용 (null 방지)
        return "board/postForm";
    }

    // 게시글 작성 요청
    @PostMapping("/post")
    public String create(PostDTO dto, RedirectAttributes ra)
    {
        try
        {
            int postId = boardService.createPost(dto);
            return "redirect:/board/" + postId;
        }
        catch (IllegalArgumentException e)
        {
            ra.addFlashAttribute("message", e.getMessage());
            return "redirect:/board/postForm";
        }
    }

    // 게시글 수정 페이지
    @GetMapping("/{postId}/edit")
    public String postEdit(@PathVariable int postId, Model model, RedirectAttributes ra)
    {
        try
        {
            model.addAttribute("categories", categoryService.getAllCategories());
            model.addAttribute("mode", "edit");
            model.addAttribute("post", boardService.getPost(postId)); // 기존 값 내려줌
            return "board/postForm"; // 작성 폼 재사용
        }
        catch (IllegalStateException e)
        {
            ra.addFlashAttribute("message", e.getMessage());
            return "redirect:/board/";
        }
    }

    // 게시글 수정 요청
    @PostMapping("/{postId}/edit")
    public String update(@PathVariable int postId, PostDTO dto, RedirectAttributes ra)
    {
        try
        {
            dto.setPostId(postId);
            boardService.updatePost(dto);
            return "redirect:/board/" + postId;
        }
        catch (IllegalArgumentException | IllegalStateException e)
        {
            ra.addFlashAttribute("message", e.getMessage());
            return "redirect:/board/" + postId + "/edit";
        }
    }

    // 게시글 삭제
    @PostMapping("/{postId}/delete")
    public String delete(@PathVariable int postId, RedirectAttributes ra)
    {
        try
        {
            boardService.deletePost(postId);
            ra.addFlashAttribute("message", "게시글이 삭제되었습니다.");
            return "redirect:/board/";
        }
        catch (IllegalStateException e)
        {
            ra.addFlashAttribute("message", e.getMessage());
            return "redirect:/board/" + postId;
        }
    }
}