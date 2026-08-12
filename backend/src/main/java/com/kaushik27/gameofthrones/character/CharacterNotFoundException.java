package com.kaushik27.gameofthrones.character;

public class CharacterNotFoundException extends RuntimeException {

    public CharacterNotFoundException(String id) {
        super("Character '%s' was not found".formatted(id));
    }
}
