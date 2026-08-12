package com.kaushik27.gameofthrones.house;

import java.util.List;

import jakarta.persistence.EntityManager;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class HouseService {

    private final HouseRepository repository;
    private final EntityManager entityManager;

    HouseService(HouseRepository repository, EntityManager entityManager) {
        this.repository = repository;
        this.entityManager = entityManager;
    }

    HousesResponse findAll() {
        List<HouseResponse> items = repository.findAll().stream()
                .sorted(java.util.Comparator.comparing(HouseRecord::getName))
                .map(house -> HouseResponse.from(house, characterCount(house.getName())))
                .toList();
        return new HousesResponse(items, items.size());
    }

    HouseResponse findByName(String name) {
        HouseRecord house = repository.findById(name)
                .orElseThrow(() -> new HouseNotFoundException(name));
        return HouseResponse.from(house, characterCount(name));
    }

    private long characterCount(String house) {
        return entityManager.createQuery("select count(character) from CharacterRecord character where character.house = :house", Long.class)
                .setParameter("house", house)
                .getSingleResult();
    }

    record HousesResponse(List<HouseResponse> items, int itemsCount) {
    }
}
