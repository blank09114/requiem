package com.infected_requiem.requiem.api;

import com.infected_requiem.requiem.dto.user.LoginRequestDTO;
import com.infected_requiem.requiem.dto.user.LoginResponseDTO;
import com.infected_requiem.requiem.dto.user.ExistsResponseDTO;
import com.infected_requiem.requiem.dto.user.SignupRequestDTO;
import com.infected_requiem.requiem.dto.user.UserDTO;
import com.infected_requiem.requiem.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserApi {

    private final UserService userService;

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO req, HttpServletResponse response)
    {
        UserDTO user = userService.login(req.getUserId(), req.getUserPw());

        if (user == null) { return ResponseEntity.ok(new LoginResponseDTO(false)); }

        String token = userService.createJwt(user);

        ResponseCookie cookie = ResponseCookie.from("ACCESS_TOKEN", token)
        .httpOnly(true).secure(false).path("/").maxAge(60 * 60 * 24 * 30)
        .sameSite("Lax").build();

        response.addHeader("Set-Cookie", cookie.toString());

        return ResponseEntity.ok(new LoginResponseDTO(true));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response)
    {
        ResponseCookie cookie = ResponseCookie.from("ACCESS_TOKEN", "")
        .httpOnly(true).secure(false).path("/").maxAge(0).sameSite("Lax").build();

        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok().build();
    }

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody SignupRequestDTO req)
    {
        UserDTO user = new UserDTO();
        user.setUserId(req.getUserId());
        user.setUserPw(req.getUserPw());
        user.setUserName(req.getUserName());

        userService.createUser(user);
        return ResponseEntity.ok().build();
    }

    // ID 중복 검사
    @GetMapping("/exists")
    public ResponseEntity<ExistsResponseDTO> exists(@RequestParam String userId)
    {
        boolean exists = userService.isUserIdExists(userId);
        return ResponseEntity.ok(new ExistsResponseDTO(exists));
    }
}
