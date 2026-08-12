package com.kaushik27.gameofthrones.episode;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "episodes")
class EpisodeRecord {
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
    String getId() { return id; }
    int getSeason() { return season; }
    int getEpisode() { return episode; }
    String getTitle() { return title; }
    LocalDate getAirDate() { return airDate; }
    int getRuntimeMinutes() { return runtimeMinutes; }
    String getDirector() { return director; }
    String getWritersJson() { return writersJson; }
    String getSummary() { return summary; }
    String getThemesJson() { return themesJson; }
    String getCharacterIdsJson() { return characterIdsJson; }
    String getEventIdsJson() { return eventIdsJson; }
}
