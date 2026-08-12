package com.kaushik27.gameofthrones.config;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
class ApiObservabilityFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long started = System.nanoTime();
        response.setHeader("Grainger-Archive-Data-Source", "H2");
        response.setHeader("Grainger-Archive-Api-Version", "v1");
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started);
            response.setHeader("Server-Timing", "application;dur=" + duration);
        }
    }
}
