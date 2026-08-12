package com.kaushik27.gameofthrones.house;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "houses")
class HouseRecord {
    @Id private String name;
    private String words;
    private String seat;
    private String region;
    private String sigil;
    private String animal;
    @Column(name = "ruler_end") private String rulerEnd;
    @Column(name = "sigil_color") private String sigilColor;

    protected HouseRecord() { }
    String getName() { return name; }
    String getWords() { return words; }
    String getSeat() { return seat; }
    String getRegion() { return region; }
    String getSigil() { return sigil; }
    String getAnimal() { return animal; }
    String getRulerEnd() { return rulerEnd; }
    String getSigilColor() { return sigilColor; }
}
