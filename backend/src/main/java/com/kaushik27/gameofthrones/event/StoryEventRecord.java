package com.kaushik27.gameofthrones.event;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "story_events")
class StoryEventRecord {
    @Id private String id;
    @Column(name = "season_number") private int season;
    private String title;
    @Column(name = "event_date") private String date;
    @Column(name = "event_type") private String type;
    @Lob @Column(name = "houses_json") private String housesJson;
    @Lob @Column(name = "character_ids_json") private String characterIdsJson;
    @Lob private String summary;
    protected StoryEventRecord() { }
    String getId() { return id; } int getSeason() { return season; } String getTitle() { return title; }
    String getDate() { return date; } String getType() { return type; } String getHousesJson() { return housesJson; }
    String getCharacterIdsJson() { return characterIdsJson; } String getSummary() { return summary; }
}
