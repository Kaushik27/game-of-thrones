package com.kaushik27.gameofthrones.quote;

import com.kaushik27.gameofthrones.character.CharacterRecord;
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
class QuoteRecord {
    @Id private String id;
    @Column(name = "character_id") private String characterId;
    @Lob @Column(name = "quote_text") private String text;
    @Column(name = "season_number") private int season;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", insertable = false, updatable = false)
    private CharacterRecord character;

    protected QuoteRecord() { }
    String getId() { return id; }
    String getCharacterId() { return characterId; }
    String getText() { return text; }
    int getSeason() { return season; }
    CharacterRecord getCharacter() { return character; }
}
