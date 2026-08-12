package com.kaushik27.gameofthrones.character;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "character_records")
public class CharacterRecord {

    @Id
    @Column(length = 100, nullable = false)
    private String id;

    @Column(length = 150, nullable = false)
    private String name;

    @Column(length = 100, nullable = false)
    private String house;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private CharacterStatus status;

    @Column(length = 150, nullable = false)
    private String actor;

    @Column(name = "biography", length = 2000, nullable = false)
    private String biography;

    @Column(name = "sigil_color", length = 7, nullable = false)
    private String sigilColor;

    protected CharacterRecord() {
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getHouse() { return house; }
    public CharacterStatus getStatus() { return status; }
    public String getActor() { return actor; }
    public String getBiography() { return biography; }
    public String getSigilColor() { return sigilColor; }
}
