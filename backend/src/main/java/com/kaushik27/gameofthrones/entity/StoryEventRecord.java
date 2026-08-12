package com.kaushik27.gameofthrones.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "story_events")
public class StoryEventRecord {
    @Id private String id;
    @Column(name = "season_number") private int season;
    private String title;
    @Column(name = "event_date") private String date;
    @Column(name = "event_type") private String type;
    @Lob @Column(name = "houses_json") private String housesJson;
    @Lob @Column(name = "character_ids_json") private String characterIdsJson;
    @Lob private String summary;
    protected StoryEventRecord() { }
    public String getId() { return id; } public int getSeason() { return season; } public String getTitle() { return title; }
    public String getDate() { return date; } public String getType() { return type; } public String getHousesJson() { return housesJson; }
    public String getCharacterIdsJson() { return characterIdsJson; } public String getSummary() { return summary; }
}
