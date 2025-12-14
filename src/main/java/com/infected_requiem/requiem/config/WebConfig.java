package com.infected_requiem.requiem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer
{
    @Value("${file.upload.path}")
    private String uploadRoot;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry)
    {
        String location = "file:" + (uploadRoot.endsWith("/") ? uploadRoot : uploadRoot + "/");
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }
}