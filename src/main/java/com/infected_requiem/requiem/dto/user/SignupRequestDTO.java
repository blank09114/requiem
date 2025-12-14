package com.infected_requiem.requiem.dto.user;

import lombok.Data;

@Data
public class SignupRequestDTO
{
    private String userId;
    private String userPw;
    private String userName;
}