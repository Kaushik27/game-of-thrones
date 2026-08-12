package com.kaushik27.gameofthrones.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "relationships")
public class RelationshipRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "source_id") private String sourceId;
    @Column(name = "target_id") private String targetId;
    @Column(name = "relationship_type") private String type;
    private String subtype;
    private String label;

    protected RelationshipRecord() { }
    public Long getId() { return id; }
    public String getSourceId() { return sourceId; }
    public String getTargetId() { return targetId; }
    public String getType() { return type; }
    public String getSubtype() { return subtype; }
    public String getLabel() { return label; }
}
