package com.infected_requiem.requiem.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.infected_requiem.requiem.dto.GeustbookDTO;
import com.infected_requiem.requiem.service.GuestbookService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/guestbook")
public class GuestbookApi
{
    private final GuestbookService guestbookService;

    // 신규 방명록 등록
    @PostMapping("/submit")
    public ResponseEntity<GeustbookDTO> insertGuestbook(@RequestBody GeustbookDTO dto, Authentication authentication)
    {
        dto.setUserId(authentication.getName());

        try
        {
            guestbookService.insertGuestbook(dto);
            return ResponseEntity.ok(dto);
        }
        catch (IllegalStateException e) { return ResponseEntity.status(403).build(); }
    }

    // 카운팅
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> count()
    { return ResponseEntity.ok(Map.of("count", guestbookService.count())); }

    // 방명록 조회
    @GetMapping("/list")
    public ResponseEntity<List<GeustbookDTO>> list(@RequestParam(defaultValue = "1") int page)
    { return ResponseEntity.ok(guestbookService.getPage(page)); }

    // 답변 등록
    @PostMapping("/{guestbookId}/answer") public ResponseEntity<Map<String, Object>> answer
    (@PathVariable int guestbookId, @RequestBody GeustbookDTO dto)
    {
        dto.setGuestbookId(guestbookId);

        try
        {
            guestbookService.answer(dto);
            return ResponseEntity.ok(Map.of("answered", true));
        }
        catch (IllegalStateException e)
        { return ResponseEntity.badRequest().body(Map.of("answered", false, "message", e.getMessage())); }
    }

    // 답변 삭제
    @DeleteMapping("/{guestbookId}/answer")
    public ResponseEntity<Map<String, Object>> deleteAnswer(@PathVariable int guestbookId)
    {
        try
        {
            guestbookService.deleteAnswer(guestbookId);
            return ResponseEntity.ok(Map.of("deleted", true));
        }
        catch (IllegalStateException e)
        {
            return ResponseEntity.badRequest().body(Map.of(
                "deleted", false,"message", e.getMessage()
            ));
        }
    }

    // 유저 차단
    @PostMapping("/{guestbookId}/block")
    public ResponseEntity<Map<String, Object>> block(@PathVariable int guestbookId)
    {
        try { return ResponseEntity.ok(guestbookService.blockUserAndDeleteAllGuestbooks(guestbookId)); }
        catch (IllegalStateException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }
}