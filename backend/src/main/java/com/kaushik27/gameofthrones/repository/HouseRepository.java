package com.kaushik27.gameofthrones.repository;

import com.kaushik27.gameofthrones.entity.HouseRecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface HouseRepository extends JpaRepository<HouseRecord, String> {
    @Query("""
            select h.name as name, h.words as words, h.seat as seat, h.region as region,
                   h.sigil as sigil, h.animal as animal, h.rulerEnd as rulerEnd,
                   h.sigilColor as sigilColor, count(c.id) as charactersCount
            from HouseRecord h left join CharacterRecord c on lower(c.house) = lower(h.name)
            group by h.name, h.words, h.seat, h.region, h.sigil, h.animal, h.rulerEnd, h.sigilColor
            order by h.name
            """)
    List<HouseSummaryProjection> findAllSummaries();
}
