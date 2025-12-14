package com.infected_requiem.requiem.service;

import com.infected_requiem.requiem.dto.log.CategoryDTO;
import com.infected_requiem.requiem.repository.CategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService
{
    private final CategoryMapper categoryMapper;

    // 카테고리 등록
    public void createCategory(CategoryDTO dto)
    {
        String name = dto.getTagName().trim();

        if (name.isEmpty()) throw new IllegalArgumentException("카테고리 이름은 비어있을 수 없습니다.");
        if (categoryMapper.existsByName(name) == 1) throw new IllegalStateException("이미 존재하는 카테고리입니다.");

        dto.setTagName(name);
        categoryMapper.insertCategory(dto);
    }

    // 카테고리 조회
    public List<CategoryDTO> getAllCategories() { return categoryMapper.findAll(); }

    // 카테고리 삭제
    public void deleteCategory(String tagName)
    {
        String name = tagName.trim();

        if (name.isEmpty()) throw new IllegalArgumentException("카테고리 이름은 비어있을 수 없습니다.");
        if ("공지".equals(name)) throw new IllegalStateException("공지 카테고리는 삭제할 수 없습니다.");

        Integer id = categoryMapper.findIdByName(name);
        if (id == null) throw new IllegalStateException("존재하지 않는 카테고리입니다.");

        int deleted = categoryMapper.deleteByName(name);
        if (deleted == 0) throw new IllegalStateException("카테고리 삭제에 실패했습니다.");
    }
}
