package com.infected_requiem.requiem.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtCookieAuthFilter extends OncePerRequestFilter
{
    // 쿠키 이름
    public static final String ACCESS_COOKIE = "ACCESS_TOKEN";

    private final JwtTokenProvider jwtTokenProvider;

    public JwtCookieAuthFilter(JwtTokenProvider jwtTokenProvider) { this.jwtTokenProvider = jwtTokenProvider; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException
    {
        if (SecurityContextHolder.getContext().getAuthentication() == null)
        {
            String token = extractCookie(request, ACCESS_COOKIE);

            if (token != null && jwtTokenProvider.validate(token))
            {
                Claims claims = jwtTokenProvider.parseClaims(token);

                String userId = claims.getSubject();

                Object roleObj = claims.get("role");
                String role = (roleObj == null) ? "USER" : String.valueOf(roleObj);

                var auth = new UsernamePasswordAuthenticationToken
                (userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request)
    {
        String uri = request.getRequestURI();

        if (uri.startsWith("/api/users/login")) return true;
        if (uri.startsWith("/api/users/signup")) return true;
        if (uri.startsWith("/api/users/exists")) return true;

        if (uri.startsWith("/css/")) return true;
        if (uri.startsWith("/js/")) return true;
        if (uri.startsWith("/file/")) return true;

        return false;
    }

    private String extractCookie(HttpServletRequest request, String name)
    {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        for (Cookie c : cookies) { if (name.equals(c.getName())) return c.getValue(); }
        return null;
    }
}