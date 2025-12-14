package com.infected_requiem.requiem.api;

import com.infected_requiem.requiem.dto.GalleryDTO;
import com.infected_requiem.requiem.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/gallery")
public class GalleryApi
{
    private final GalleryService galleryService;

    // 이미지 등록
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(@RequestBody GalleryDTO dto)
    {
        int imgId = galleryService.upload(dto);

        Map<String, Object> result = new HashMap<>();
        result.put("imgId", imgId);
        return ResponseEntity.ok(result);
    }

    // 카운팅
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> count()
    {  return ResponseEntity.ok(Map.of("count", galleryService.count())); }

    // 이미지 조회
    @GetMapping("/list")
    public ResponseEntity<List<GalleryDTO>> list(@RequestParam(defaultValue = "1") int page)
    { return ResponseEntity.ok(galleryService.getPage(page)); }

    // 이미지 삭제
    @DeleteMapping("/delete/{imgId}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable int imgId)
    {
        galleryService.delete(imgId);
        return ResponseEntity.ok(Map.of("deleted", true));
    }
}