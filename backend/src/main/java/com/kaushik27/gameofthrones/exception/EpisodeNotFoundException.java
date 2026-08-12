package com.kaushik27.gameofthrones.exception;

public class EpisodeNotFoundException extends RuntimeException {
    public EpisodeNotFoundException(String id) { super("Episode '%s' was not found".formatted(id)); }
}
