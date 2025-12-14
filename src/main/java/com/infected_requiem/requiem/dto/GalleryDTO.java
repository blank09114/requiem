package com.infected_requiem.requiem.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class GalleryDTO
{
    private Integer imgId;
    private String imgUrl;
    private String imgName;
    private String imgArtist;
    private LocalDateTime imgDate;
}