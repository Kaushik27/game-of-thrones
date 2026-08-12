package com.kaushik27.gameofthrones.dto;

import com.kaushik27.gameofthrones.entity.HouseRecord;

public record HouseResponse(
        String name,
        String words,
        String seat,
        String region,
        String sigil,
        String animal,
        String rulerEnd,
        String sigilColor,
        long charactersCount) {

    public static HouseResponse from(HouseRecord house, long charactersCount) {
        return new HouseResponse(house.getName(), house.getWords(), house.getSeat(), house.getRegion(),
                house.getSigil(), house.getAnimal(), house.getRulerEnd(), house.getSigilColor(), charactersCount);
    }
}
