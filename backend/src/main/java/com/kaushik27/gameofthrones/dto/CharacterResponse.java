package com.kaushik27.gameofthrones.dto;

import com.kaushik27.gameofthrones.entity.CharacterRecord;
import com.kaushik27.gameofthrones.entity.CharacterStatus;

public record CharacterResponse(
        String id,
        String name,
        String house,
        CharacterStatus status,
        String actor,
        String biography,
        String sigilColor,
        String portraitUrl) {

    public static CharacterResponse from(CharacterRecord character) {
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
