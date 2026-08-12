package com.kaushik27.gameofthrones.battle;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "battles")
class BattleRecord {
    @Id private String id;
    private String name;
    @Column(name = "season_number") private int season;
    private String location;
    @Lob @Column(name = "combatants_json") private String combatantsJson;
    @Lob private String outcome;
    @Lob private String casualties;
    @Lob @Column(name = "linked_character_ids_json") private String linkedCharacterIdsJson;
    @Lob @Column(name = "linked_event_ids_json") private String linkedEventIdsJson;
    protected BattleRecord() { }
    String getId() { return id; } String getName() { return name; } int getSeason() { return season; }
    String getLocation() { return location; } String getCombatantsJson() { return combatantsJson; }
    String getOutcome() { return outcome; } String getCasualties() { return casualties; }
    String getLinkedCharacterIdsJson() { return linkedCharacterIdsJson; } String getLinkedEventIdsJson() { return linkedEventIdsJson; }
}
