package com.infected_requiem.requiem.repository;

import org.apache.ibatis.annotations.Mapper;
import com.infected_requiem.requiem.dto.ProfileDTO;

@Mapper
public interface MainMapper
{
    // 조회
    ProfileDTO selectProfile();

    // 수정
    int updateProfile(ProfileDTO profileDTO);
}