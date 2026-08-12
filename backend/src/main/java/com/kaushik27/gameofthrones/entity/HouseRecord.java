package com.kaushik27.gameofthrones.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "houses")
public class HouseRecord {
    @Id private String name;
    private String words;
    private String seat;
    private String region;
    private String sigil;
    private String animal;
    @Column(name = "ruler_end") private String rulerEnd;
    @Column(name = "sigil_color") private String sigilColor;

    protected HouseRecord() { }
    public String getName() { return name; }
    public String getWords() { return words; }
    public String getSeat() { return seat; }
    public String getRegion() { return region; }
    public String getSigil() { return sigil; }
    public String getAnimal() { return animal; }
    public String getRulerEnd() { return rulerEnd; }
    public String getSigilColor() { return sigilColor; }
}
