package com.kaushik27.gameofthrones.dto;

import com.kaushik27.gameofthrones.entity.CharacterStatus;

public enum CharacterStatusFilter {
    ALIVE,
    DEAD,
    UNKNOWN;

    public CharacterStatus toEntityValue() {
        return CharacterStatus.valueOf(name());
    }
}
