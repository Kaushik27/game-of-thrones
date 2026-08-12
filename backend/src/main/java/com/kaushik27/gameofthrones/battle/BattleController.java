package com.kaushik27.gameofthrones.battle;

import java.util.List;

import com.kaushik27.gameofthrones.common.JsonCollections;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.core.type.TypeReference;

@Validated
@RestController
@RequestMapping("/api/v1/battles")
class BattleController {
    private static final TypeReference<List<CombatantResponse>> COMBATANTS = new TypeReference<>() { };
    private final BattleRepository repository;
    private final JsonCollections json;
    BattleController(BattleRepository repository, JsonCollections json) { this.repository = repository; this.json = json; }

    @GetMapping
    @Transactional(readOnly = true)
    BattlesResponse findAll(@RequestParam(required = false) @Min(1) @Max(8) Integer season) {
        List<BattleResponse> items = (season == null ? repository.findAllByOrderBySeasonAscNameAsc() : repository.findBySeasonOrderByName(season))
                .stream().map(this::response).toList();
        return new BattlesResponse(items, items.size());
    }

    @GetMapping("/{battleId}")
    @Transactional(readOnly = true)
    BattleResponse findById(@PathVariable String battleId) {
        return repository.findById(battleId).map(this::response)
                .orElseThrow(() -> new BattleNotFoundException(battleId));
    }

    private BattleResponse response(BattleRecord battle) {
        return new BattleResponse(battle.getId(), battle.getName(), battle.getSeason(), battle.getLocation(),
                json.read(battle.getCombatantsJson(), COMBATANTS), battle.getOutcome(), battle.getCasualties(),
                json.strings(battle.getLinkedCharacterIdsJson()), json.strings(battle.getLinkedEventIdsJson()));
    }

    record CombatantResponse(String side, List<String> houses, List<String> characters) { }
    record BattleResponse(String id, String name, int season, String location, List<CombatantResponse> combatants,
                          String outcome, String casualties, List<String> linkedCharacterIds, List<String> linkedEventIds) { }
    record BattlesResponse(List<BattleResponse> items, int itemsCount) { }
}
