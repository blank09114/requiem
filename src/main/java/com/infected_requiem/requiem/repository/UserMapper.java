package com.infected_requiem.requiem.repository;

import com.infected_requiem.requiem.dto.user.UserDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper
{
    // 로그인
    UserDTO selectUserById(@Param("userId") String userId);

    // 회원가입
    int insertUser(UserDTO user);

    // ID 중복 검사
    int countByUserId(@Param("userId") String userId);
}