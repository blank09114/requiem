package com.infected_requiem.requiem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig
{
    // 비밀번호 암호화
    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public SecurityFilterChain securityFilterChain
    (HttpSecurity http, JwtTokenProvider jwtTokenProvider ) throws Exception
    {
        http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests
        (auth -> auth
            .requestMatchers("/api/img/**").hasRole("ADMIN")
            .requestMatchers("/profileEdit/**").hasRole("ADMIN")
            .requestMatchers("/api/categories/add").hasRole("ADMIN")
            .requestMatchers("/api/categories/delete").hasRole("ADMIN")
            .requestMatchers("/board/postForm").hasRole("ADMIN")
            .requestMatchers("/board/post").hasRole("ADMIN")
            .requestMatchers("/board/*/edit").hasRole("ADMIN")
            .requestMatchers("/board/*/delete").hasRole("ADMIN")
            .requestMatchers("/api/gallery/upload").hasRole("ADMIN")
            .requestMatchers("/api/gallery/delete/**").hasRole("ADMIN")
            .requestMatchers("/api/guestbook/submit").authenticated()
            .requestMatchers("/api/guestbook/*/answer").authenticated()
            .requestMatchers("/api/guestbook/*/block").authenticated()
            .anyRequest().permitAll()
        )
        .formLogin(form -> form.disable())
        .httpBasic(basic -> basic.disable());

        http.addFilterBefore
        (new JwtCookieAuthFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}