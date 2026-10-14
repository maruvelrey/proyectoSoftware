package com.tienda.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Obtiene la ruta absoluta de la carpeta de subidas en tu proyecto
        String uploadDir = Paths.get("src/main/resources/static/uploads/").toAbsolutePath().toUri().toString();

        // Asigna la ruta pública /uploads/** al directorio físico en el disco
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadDir);
    }
}