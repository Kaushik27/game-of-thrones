package com.kaushik27.gameofthrones.repository;

import java.util.List;

import com.kaushik27.gameofthrones.entity.RelationshipRecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RelationshipRepository extends JpaRepository<RelationshipRecord, Long> {
    List<RelationshipRecord> findBySourceIdOrTargetIdOrderByTypeAsc(String sourceId, String targetId);

    @Query("""
            select r.id as id,
                   case when r.sourceId = :characterId then r.targetId else r.sourceId end as relatedCharacterId,
                   related.name as relatedCharacterName,
                   r.type as type, r.subtype as subtype, r.label as label
            from RelationshipRecord r join CharacterRecord related
              on related.id = case when r.sourceId = :characterId then r.targetId else r.sourceId end
            where r.sourceId = :characterId or r.targetId = :characterId
            order by r.type
            """)
    List<RelationshipSummaryProjection> findSummariesForCharacter(@Param("characterId") String characterId);
}
