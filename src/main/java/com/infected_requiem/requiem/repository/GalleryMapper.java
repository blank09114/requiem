package com.infected_requiem.requiem.repository;

import com.infected_requiem.requiem.dto.GalleryDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GalleryMapper
{
    // 이미지 업로드
    int insertGallery(GalleryDTO galleryDTO);

    // 카운팅
    int countGallery();

    // 이미지 조회
    List<GalleryDTO> selectGalleryPage(@Param("limit") int limit, @Param("offset") int offset);

    // 이미지 id로 이미지 url 조회
    String selectImgUrlById(@Param("imgId") int imgId);

    // 이미지 삭제
    int deleteGallery(@Param("imgId") int imgId);
}
