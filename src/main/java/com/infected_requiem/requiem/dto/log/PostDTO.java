package com.infected_requiem.requiem.dto.log;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostDTO
{
    private Integer postId;
    private Integer tagId;
    private String postTitle;
    private String postContent;
    private LocalDateTime postDate;
}