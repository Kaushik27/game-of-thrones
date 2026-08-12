package com.kaushik27.gameofthrones.service;

import java.util.List;

import com.kaushik27.gameofthrones.dto.HouseResponse;
import com.kaushik27.gameofthrones.dto.HousesResponse;
import com.kaushik27.gameofthrones.exception.HouseNotFoundException;
import com.kaushik27.gameofthrones.repository.HouseRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HouseService {

    private final HouseRepository repository;

    public HouseService(HouseRepository repository) {
        this.repository = repository;
    }

    public HousesResponse findAll() {
        List<HouseResponse> items = repository.findAllSummaries().stream()
                .map(house -> new HouseResponse(house.getName(), house.getWords(), house.getSeat(), house.getRegion(),
                        house.getSigil(), house.getAnimal(), house.getRulerEnd(), house.getSigilColor(), house.getCharactersCount()))
                .toList();
        return new HousesResponse(items, items.size());
    }

    public HouseResponse findByName(String name) {
        return repository.findAllSummaries().stream().filter(summary -> summary.getName().equals(name))
                .findFirst()
                .map(summary -> new HouseResponse(summary.getName(), summary.getWords(), summary.getSeat(), summary.getRegion(),
                        summary.getSigil(), summary.getAnimal(), summary.getRulerEnd(), summary.getSigilColor(), summary.getCharactersCount()))
                .orElseThrow(() -> new HouseNotFoundException(name));
    }

}
