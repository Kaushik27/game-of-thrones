package com.kaushik27.gameofthrones.character;

public record CharacterResponse(
        String id,
        String name,
        String house,
        CharacterStatus status,
        String actor,
        String biography,
        String sigilColor,
        String portraitUrl) {

    static CharacterResponse from(CharacterRecord character) {
        return new CharacterResponse(
                character.getId(),
                character.getName(),
                character.getHouse(),
                character.getStatus(),
                character.getActor(),
                character.getBiography(),
                character.getSigilColor(),
                "/actors/" + character.getId() + ".jpg");
    }
}
