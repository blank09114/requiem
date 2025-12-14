package com.infected_requiem.requiem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserController
{
    // 로그인
    @GetMapping("/login")
    public String login() { return "user/login"; }

    // 회원가입
    @GetMapping("/join")
    public String join() { return "user/join"; }
}
