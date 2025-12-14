package com.infected_requiem.requiem.dto.user;

import lombok.Data;

@Data
public class UserDTO
{
    private String userId;
    private String userPw;
    private String userName;
    private String userRole;
    private boolean isBlock;
}