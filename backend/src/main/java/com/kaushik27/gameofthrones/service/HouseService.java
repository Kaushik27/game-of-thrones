package com.kaushik27.gameofthrones.service;

import java.util.List;

import com.kaushik27.gameofthrones.dto.HouseResponse;
import com.kaushik27.gameofthrones.dto.HousesResponse;
import com.kaushik27.gameofthrones.entity.HouseRecord;
import com.kaushik27.gameofthrones.exception.HouseNotFoundException;
import com.kaushik27.gameofthrones.repository.HouseRepository;

import jakarta.persistence.EntityManager;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HouseService {

    private final HouseRepository repository;
    private final EntityManager entityManager;

    public HouseService(HouseRepository repository, EntityManager entityManager) {
        this.repository = repository;
        this.entityManager = entityManager;
    }

    public HousesResponse findAll() {
        List<HouseResponse> items = repository.findAll().stream()
                .sorted(java.util.Comparator.comparing(HouseRecord::getName))
                .map(house -> HouseResponse.from(house, characterCount(house.getName())))
                .toList();
        return new HousesResponse(items, items.size());
    }

    public HouseResponse findByName(String name) {
        HouseRecord house = repository.findById(name)
                .orElseThrow(() -> new HouseNotFoundException(name));
        return HouseResponse.from(house, characterCount(name));
    }

    private long characterCount(String house) {
        return entityManager.createQuery("select count(character) from CharacterRecord character where character.house = :house", Long.class)
                .setParameter("house", house)
                .getSingleResult();
    }

}
