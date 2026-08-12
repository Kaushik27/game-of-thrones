package com.kaushik27.gameofthrones.dto;

import java.util.List;

import com.kaushik27.gameofthrones.entity.CharacterRecord;

import org.springframework.data.domain.Page;

public record CharacterPageResponse(
        List<CharacterResponse> items,
        long itemsCount,
        int page,
        int pageSize,
        int pagesCount) {

    public static CharacterPageResponse from(Page<CharacterRecord> result) {
        return new CharacterPageResponse(
                result.getContent().stream().map(CharacterResponse::from).toList(),
                result.getTotalElements(),
                result.getNumber(),
                result.getSize(),
                result.getTotalPages());
    }
}
