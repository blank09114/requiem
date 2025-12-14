package com.infected_requiem.requiem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeustbookDTO
{
    private Integer guestbookId;
    private String userId;
    private String userName;
    private String guestbookContent;
    private Boolean guestbookSecret;
    private LocalDateTime guestbookDate;
    private String answerContent;
    private LocalDateTime answerDate;
}