package com.infected_requiem.requiem.api;

import com.infected_requiem.requiem.dto.log.PostDTO;
import com.infected_requiem.requiem.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board")
public class BoardApi
{
    private final BoardService boardService;

    // 카운팅
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> count(@RequestParam(required = false) Integer tagId)
    { return ResponseEntity.ok(Map.of("count", boardService.count(tagId))); }

    // 목록
    @GetMapping("/list")
    public ResponseEntity<List<PostDTO>> list(@RequestParam(defaultValue = "1") int page, @RequestParam(required = false) Integer tagId)
    { return ResponseEntity.ok(boardService.getPage(page, tagId)); }
}