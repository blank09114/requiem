package com.infected_requiem.requiem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MiniBoardController
{
    // 갤러리
    @GetMapping("/gallery")
    public String gallery(Model model)
    {
        model.addAttribute("activeMenu", "gallery");
        return "board/gallery";
    }

    // 방명록
    @GetMapping("/guestbook")
    public String guestbook(Model model)
    {
        model.addAttribute("activeMenu", "guestbook");
        return "board/guestbook";
    }
}