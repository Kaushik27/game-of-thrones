package com.kaushik27.gameofthrones.repository;

import java.util.List;

import com.kaushik27.gameofthrones.entity.RelationshipRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RelationshipRepository extends JpaRepository<RelationshipRecord, Long> {
    List<RelationshipRecord> findBySourceIdOrTargetIdOrderByTypeAsc(String sourceId, String targetId);
}
