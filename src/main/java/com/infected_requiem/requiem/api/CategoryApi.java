package com.infected_requiem.requiem.api;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.infected_requiem.requiem.dto.log.CategoryDTO;
import com.infected_requiem.requiem.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryApi
{
    private final CategoryService categoryService;

    // 카테고리 생성
    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody CategoryDTO dto)
    {
        try
        {
            categoryService.createCategory(dto);
            return ResponseEntity.ok(dto);
        }
        catch (IllegalArgumentException e)
        { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
        catch (IllegalStateException e)
        { return ResponseEntity.status(409).body(Map.of("message", e.getMessage())); }
    }

    // 카테고리 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(@RequestParam String tagName)
    {
        try
        {
            categoryService.deleteCategory(tagName);
            return ResponseEntity.ok(Map.of("deleted", true));
        }
        catch (IllegalArgumentException e)
        { return ResponseEntity.badRequest().body(Map.of("deleted", false, "message", e.getMessage())); }
        catch (IllegalStateException e)
        { return ResponseEntity.status(409).body(Map.of("deleted", false, "message", e.getMessage())); }
    }
}
