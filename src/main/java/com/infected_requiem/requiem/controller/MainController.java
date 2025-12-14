package com.infected_requiem.requiem.controller;

import com.infected_requiem.requiem.dto.ProfileDTO;
import com.infected_requiem.requiem.service.MainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@RequiredArgsConstructor
public class MainController
{
    private final MainService mainService;

    // 인트로 페이지
    @GetMapping("/")
    public String intro() { return "main/intro"; }

    // 메인 페이지
    @GetMapping("/main")
    public String main(Model model)
    {
        model.addAttribute("profile", mainService.getProfile());
        return "main/main";
    }

    // 프로필 수정 페이지
    @GetMapping("/profileEdit")
    public String profileEdit(Model model)
    {
        model.addAttribute("profile", mainService.getProfile());
        return "main/profileEdit";
    }

    // 프로필 저장
    @PostMapping("/profileEdit")
    public String updateProfile(@ModelAttribute ProfileDTO profileDTO)
    {
        mainService.updateProfile(profileDTO);
        return "redirect:/main";
    }
}