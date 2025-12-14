package com.infected_requiem.requiem.service;

import com.infected_requiem.requiem.config.JwtTokenProvider;
import com.infected_requiem.requiem.dto.user.UserDTO;
import com.infected_requiem.requiem.repository.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 로그인
    public UserDTO login(String userId, String rawPassword)
    {
        UserDTO user = userMapper.selectUserById(userId);

        // ID 없음
        if (user == null) return null;

        // 비밀번호 불일치
        if (!passwordEncoder.matches(rawPassword, user.getUserPw())) { return null; }

        // 정상 로그인
        return user;
    }

    // 토큰 발급
    public String createJwt(UserDTO user)
    { return jwtTokenProvider.createToken(user.getUserId(), user.getUserRole()); }

    // 회원가입
    public void createUser(UserDTO user)
    {
        // 비밀번호 암호화
        user.setUserPw(passwordEncoder.encode(user.getUserPw()));
        userMapper.insertUser(user);
    }

    // ID 중복 검사
    public boolean isUserIdExists(String userId) { return userMapper.countByUserId(userId) > 0; }
}