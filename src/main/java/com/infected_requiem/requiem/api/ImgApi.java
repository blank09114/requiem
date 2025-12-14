package com.infected_requiem.requiem.api;

import com.infected_requiem.requiem.config.ImgUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@Slf4j
@RequestMapping("/api/img")
public class ImgApi
{
    @Value("${file.upload.path}")
    private String uploadRoot;

    private static final int MAX_WIDTH = 1000;

    private static final Set<String> ALLOWED_EXT = Set.of("png", "jpg", "jpeg", "gif");

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of
    (MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_GIF_VALUE);

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadImage
    (@RequestParam("file") MultipartFile file, HttpServletRequest request)
    {
        Map<String, Object> result = new HashMap<>();

        if (file == null || file.isEmpty())
        {
            result.put("message", "빈 파일입니다.");
            return ResponseEntity.badRequest().body(result);
        }

        if (file.getSize() > MAX_FILE_SIZE)
        {
            result.put("message", "파일 용량이 너무 큽니다. (최대 " + (MAX_FILE_SIZE / (1024 * 1024)) + "MB)");
            return ResponseEntity.badRequest().body(result);
        }

        String ct = Optional.ofNullable(file.getContentType()).orElse("").toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.contains(ct))
        {
            result.put("message", "이미지 파일만 업로드할 수 있습니다.");
            return ResponseEntity.badRequest().body(result);
        }

        String originalName = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), ""));
        String ext = getExtensionLower(originalName);

        if (!ALLOWED_EXT.contains(ext))
        {
            result.put("message", "지원하지 않는 확장자입니다.");
            return ResponseEntity.badRequest().body(result);
        }

        String saveName = UUID.randomUUID() + "." + ext;

        Path root = Paths.get(uploadRoot).normalize().toAbsolutePath();
        Path uploadDir = root;

        try { Files.createDirectories(uploadDir); }
        catch (IOException e)
        {
            log.error("업로드 디렉터리 생성 실패", e);
            result.put("message", "업로드 디렉터리 생성 실패");
            return ResponseEntity.internalServerError().body(result);
        }

        File tempFile = uploadDir.resolve("temp_" + saveName).toFile();
        File finalFile = uploadDir.resolve(saveName).toFile();

        try
        {
            file.transferTo(tempFile);
            ImgUtil.resizeImg(tempFile, finalFile, MAX_WIDTH);

            String publicPath = "/uploads/" + saveName;

            String absoluteUrl =
                ServletUriComponentsBuilder.fromRequestUri(request)
                .replacePath(request.getContextPath()).path(publicPath).build().toUriString();

            result.put("location", absoluteUrl);
            return ResponseEntity.ok(result);
        }
        catch (IOException e)
        {
            log.error("이미지 업로드 실패", e);
            result.put("message", "업로드 실패: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
        finally  { try { if (tempFile.exists()) tempFile.delete(); } catch (Exception ignore) {} }
    }

    private String getExtensionLower(String filename)
    {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}