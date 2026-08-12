package com.kaushik27.gameofthrones.relationship;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface RelationshipRepository extends JpaRepository<RelationshipRecord, Long> {
    List<RelationshipRecord> findBySourceIdOrTargetIdOrderByTypeAsc(String sourceId, String targetId);
}
