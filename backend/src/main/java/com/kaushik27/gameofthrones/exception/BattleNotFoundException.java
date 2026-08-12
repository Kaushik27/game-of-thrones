package com.kaushik27.gameofthrones.exception;
public class BattleNotFoundException extends RuntimeException {
    public BattleNotFoundException(String id) { super("Battle '%s' was not found".formatted(id)); }
}
