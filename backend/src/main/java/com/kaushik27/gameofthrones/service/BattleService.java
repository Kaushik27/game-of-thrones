package com.kaushik27.gameofthrones.service;

import java.util.List;

import com.kaushik27.gameofthrones.dto.BattleResponse;
import com.kaushik27.gameofthrones.dto.BattlesResponse;
import com.kaushik27.gameofthrones.dto.CombatantResponse;
import com.kaushik27.gameofthrones.entity.BattleRecord;
import com.kaushik27.gameofthrones.exception.BattleNotFoundException;
import com.kaushik27.gameofthrones.repository.BattleRepository;
import com.kaushik27.gameofthrones.util.JsonCollections;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;

@Service
@Transactional(readOnly = true)
public class BattleService {
    private static final TypeReference<List<CombatantResponse>> COMBATANTS = new TypeReference<>() { };
    private final BattleRepository repository;
    private final JsonCollections json;

    public BattleService(BattleRepository repository, JsonCollections json) {
        this.repository = repository;
        this.json = json;
    }

    public BattlesResponse findAll(Integer season) {
        List<BattleResponse> items = (season == null
                ? repository.findAllByOrderBySeasonAscNameAsc()
                : repository.findBySeasonOrderByName(season)).stream().map(this::toResponse).toList();
        return new BattlesResponse(items, items.size());
    }

    public BattleResponse findById(String battleId) {
        return repository.findById(battleId).map(this::toResponse)
                .orElseThrow(() -> new BattleNotFoundException(battleId));
    }

    private BattleResponse toResponse(BattleRecord battle) {
        return new BattleResponse(battle.getId(), battle.getName(), battle.getSeason(), battle.getLocation(),
                json.read(battle.getCombatantsJson(), COMBATANTS), battle.getOutcome(), battle.getCasualties(),
                json.strings(battle.getLinkedCharacterIdsJson()), json.strings(battle.getLinkedEventIdsJson()));
    }
}
