package com.kaushik27.gameofthrones.relationship;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "relationships")
class RelationshipRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "source_id") private String sourceId;
    @Column(name = "target_id") private String targetId;
    @Column(name = "relationship_type") private String type;
    private String subtype;
    private String label;

    protected RelationshipRecord() { }
    Long getId() { return id; }
    String getSourceId() { return sourceId; }
    String getTargetId() { return targetId; }
    String getType() { return type; }
    String getSubtype() { return subtype; }
    String getLabel() { return label; }
}
