package com.kaushik27.gameofthrones.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "quotes")
public class QuoteRecord {
    @Id private String id;
    @Column(name = "character_id") private String characterId;
    @Lob @Column(name = "quote_text") private String text;
    @Column(name = "season_number") private int season;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", insertable = false, updatable = false)
    private CharacterRecord character;

    protected QuoteRecord() { }
    public String getId() { return id; }
    public String getCharacterId() { return characterId; }
    public String getText() { return text; }
    public int getSeason() { return season; }
    public CharacterRecord getCharacter() { return character; }
}
