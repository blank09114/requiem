package com.infected_requiem.requiem.repository;

import com.infected_requiem.requiem.dto.log.CategoryDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;


@Mapper
public interface CategoryMapper
{
    // 카테고리 생성
    void insertCategory(CategoryDTO categoryDTO);

    // 카테고리 중복 검사
    int existsByName(String tagName);

    // 카테고리 조회
    List<CategoryDTO> findAll();

    // 카테고리 존재 확인
    Integer findIdByName(String tagName);

    // 카테고리 삭제
    int deleteByName(String tagName);
}