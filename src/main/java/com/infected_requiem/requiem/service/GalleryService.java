package com.infected_requiem.requiem.service;

import com.infected_requiem.requiem.dto.GalleryDTO;
import com.infected_requiem.requiem.repository.GalleryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GalleryService
{
    private final GalleryMapper galleryMapper;

    private static final int PAGE_SIZE = 10;

    @Value("${file.upload.path}")
    private String uploadRoot;

    // 이미지 업로드
    public int upload(GalleryDTO dto)
    {
        galleryMapper.insertGallery(dto);
        return dto.getImgId();
    }

    // 카운팅
    public int count() { return galleryMapper.countGallery(); }

    // 이미지 조회
    public List<GalleryDTO> getPage(int page)
    {
        int safePage = Math.max(1, page);
        int offset = (safePage - 1) * PAGE_SIZE;
        return galleryMapper.selectGalleryPage(PAGE_SIZE, offset);
    }

    // 이미지 삭제
    public void delete(int imgId)
    {
        String imgUrl = galleryMapper.selectImgUrlById(imgId);
        if (imgUrl == null || imgUrl.isBlank()) throw new IllegalArgumentException("존재하지 않는 이미지입니다.");

        int deleted = galleryMapper.deleteGallery(imgId);
        if (deleted == 0) throw new IllegalArgumentException("삭제할 데이터가 없습니다.");

        deleteFileByImgUrl(imgUrl);
    }

    private void deleteFileByImgUrl(String imgUrl)
    {
        try
        {
            String filename = extractFilename(imgUrl);
            if (filename.isBlank()) return;

            Path root = Paths.get(uploadRoot).normalize().toAbsolutePath();
            Path target = root.resolve(filename).normalize();

            if (!target.startsWith(root)) return;

            Files.deleteIfExists(target);
        }
        catch (Exception e) { }
    }

    private String extractFilename(String imgUrl)
    {
        int q = imgUrl.indexOf('?');
        String noQuery = (q >= 0) ? imgUrl.substring(0, q) : imgUrl;

        int slash = noQuery.lastIndexOf('/');
        return (slash >= 0) ? noQuery.substring(slash + 1) : noQuery;
    }
}