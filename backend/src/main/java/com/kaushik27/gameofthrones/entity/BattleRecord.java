package com.kaushik27.gameofthrones.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "battles")
public class BattleRecord {
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
    public String getId() { return id; } public String getName() { return name; } public int getSeason() { return season; }
    public String getLocation() { return location; } public String getCombatantsJson() { return combatantsJson; }
    public String getOutcome() { return outcome; } public String getCasualties() { return casualties; }
    public String getLinkedCharacterIdsJson() { return linkedCharacterIdsJson; } public String getLinkedEventIdsJson() { return linkedEventIdsJson; }
}
