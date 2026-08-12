package com.kaushik27.gameofthrones.config;

import java.io.IOException;
import java.time.Clock;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import tools.jackson.databind.ObjectMapper;

@Component
class ApiRateLimitFilter extends OncePerRequestFilter {
    private static final int REQUESTS_PER_MINUTE = 120;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock = Clock.systemUTC();
    private final ObjectMapper objectMapper;

    ApiRateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long minute = clock.instant().getEpochSecond() / 60;
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(entry -> entry.getValue().minute < minute - 1);
        }
        String client = request.getRemoteAddr();
        Window window = windows.compute(client, (key, current) ->
                current == null || current.minute != minute ? new Window(minute) : current);
        int count = window.requests.incrementAndGet();
        response.setHeader("RateLimit-Limit", String.valueOf(REQUESTS_PER_MINUTE));
        response.setHeader("RateLimit-Remaining", String.valueOf(Math.max(0, REQUESTS_PER_MINUTE - count)));
        if (count > REQUESTS_PER_MINUTE) {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/problem+json");
            ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS,
                    "The request rate limit was exceeded. Retry after 60 seconds.");
            problem.setType(java.net.URI.create("https://kaushik27.github.io/game-of-thrones/problems/rate-limited"));
            problem.setTitle("Too many requests");
            problem.setProperty("errorCode", "RATE_LIMITED");
            problem.setProperty("requestId", request.getAttribute("requestId"));
            problem.setInstance(java.net.URI.create(request.getRequestURI()));
            objectMapper.writeValue(response.getWriter(), problem);
            return;
        }
        chain.doFilter(request, response);
    }

    private static final class Window {
        private final long minute;
        private final AtomicInteger requests = new AtomicInteger();
        private Window(long minute) { this.minute = minute; }
    }
}
