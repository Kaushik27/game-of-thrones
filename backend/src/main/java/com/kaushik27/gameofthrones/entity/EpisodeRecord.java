package com.kaushik27.gameofthrones.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "episodes")
public class EpisodeRecord {
    @Id private String id;
    @Column(name = "season_number") private int season;
    @Column(name = "episode_number") private int episode;
    private String title;
    @Column(name = "air_date") private LocalDate airDate;
    @Column(name = "runtime_minutes") private int runtimeMinutes;
    private String director;
    @Lob @Column(name = "writers_json") private String writersJson;
    @Lob private String summary;
    @Lob @Column(name = "themes_json") private String themesJson;
    @Lob @Column(name = "character_ids_json") private String characterIdsJson;
    @Lob @Column(name = "event_ids_json") private String eventIdsJson;

    protected EpisodeRecord() { }
    public String getId() { return id; }
    public int getSeason() { return season; }
    public int getEpisode() { return episode; }
    public String getTitle() { return title; }
    public LocalDate getAirDate() { return airDate; }
    public int getRuntimeMinutes() { return runtimeMinutes; }
    public String getDirector() { return director; }
    public String getWritersJson() { return writersJson; }
    public String getSummary() { return summary; }
    public String getThemesJson() { return themesJson; }
    public String getCharacterIdsJson() { return characterIdsJson; }
    public String getEventIdsJson() { return eventIdsJson; }
}
