package com.kaushik27.gameofthrones.exception;

public class DatabaseTableNotFoundException extends RuntimeException {
    public DatabaseTableNotFoundException(String table) {
        super("Database table is not available: " + table);
    }
}
