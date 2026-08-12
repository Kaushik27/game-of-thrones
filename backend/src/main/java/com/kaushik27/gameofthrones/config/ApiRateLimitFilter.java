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

@Component
class ApiRateLimitFilter extends OncePerRequestFilter {
    private static final int REQUESTS_PER_MINUTE = 120;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock = Clock.systemUTC();

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
            response.getWriter().write("{\"title\":\"Too many requests\",\"status\":429,\"errorCode\":\"RATE_LIMITED\"}");
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
