package com.infected_requiem.requiem.config;

import net.coobird.thumbnailator.Thumbnails;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.*;

public class ImgUtil
{
    private static final int MAX_DIMENSION = 12000;
    private static final long MAX_PIXELS = 60_000_000L;

    public static void resizeImg(File inputFile, File outputFile, int maxWidth) throws IOException
    {
        String name = inputFile.getName();
        int dot = name.lastIndexOf('.');
        String extension = (dot >= 0 ? name.substring(dot + 1) : "").toLowerCase();

        Files.createDirectories(outputFile.toPath().getParent());

        if ("gif".equals(extension))
        {
            Files.copy(inputFile.toPath(), outputFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            return;
        }

        BufferedImage originalImage = ImageIO.read(inputFile);
        if (originalImage == null) throw new IOException("이미지 디코딩 실패");

        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        if (width <= 0 || height <= 0) throw new IOException("이미지 크기 정보가 올바르지 않습니다.");
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) throw new IOException("이미지 해상도가 너무 큽니다.");
        if ((long) width * (long) height > MAX_PIXELS) throw new IOException("이미지 픽셀 수가 너무 큽니다.");

        if (width <= maxWidth)
        {
            Files.copy(inputFile.toPath(), outputFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            return;
        }

        Thumbnails.of(inputFile).width(maxWidth).keepAspectRatio(true).outputFormat(extension).toFile(outputFile);
    }
}