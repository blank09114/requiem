package com.infected_requiem.requiem.service;

import org.springframework.stereotype.Service;

import com.infected_requiem.requiem.dto.ProfileDTO;
import com.infected_requiem.requiem.repository.MainMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MainService
{
    private final MainMapper mainMapper;

    // 조회
    public ProfileDTO getProfile() { return mainMapper.selectProfile(); }

    // 수정
    public void updateProfile(ProfileDTO profileDTO) { mainMapper.updateProfile(profileDTO); }
}