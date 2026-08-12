package com.kaushik27.gameofthrones.exception;

public class HouseNotFoundException extends RuntimeException {
    public HouseNotFoundException(String name) {
        super("House '%s' was not found".formatted(name));
    }
}
