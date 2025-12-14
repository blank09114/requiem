package com.infected_requiem.requiem.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider
{
    private final SecretKey key;
    private final long accessTokenMillis;

    public JwtTokenProvider(@Value("${jwt.secret}") String secret, @Value("${jwt.access-token-seconds}") long accessTokenSeconds )
    {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenMillis = accessTokenSeconds * 1000;
    }

    // 토큰 생성
    public String createToken(String userId, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenMillis);

        return Jwts.builder().subject(userId).claim("role", role).issuedAt(now).expiration(expiry).signWith(key).compact();
    }

    // 토큰 유효성 검사
    public boolean validate(String token)
    {
        try { Jwts.parser().verifyWith(key).build().parseSignedClaims(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }

    // Claims 파싱
    public Claims parseClaims(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
