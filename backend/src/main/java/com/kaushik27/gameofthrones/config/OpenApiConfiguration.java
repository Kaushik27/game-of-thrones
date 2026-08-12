package com.kaushik27.gameofthrones.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {
    @Bean
    OpenAPI archiveOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Game of Thrones Archive API")
                .version("v1")
                .description("Read-only REST API demonstrating React, Spring Boot, Flyway, and H2 integration.")
                .contact(new Contact().name("Kaushik27").url("https://github.com/Kaushik27/game-of-thrones"))
                .license(new License().name("Portfolio demonstration")));
    }
}
