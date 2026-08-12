package com.kaushik27.gameofthrones.repository;

import com.kaushik27.gameofthrones.entity.BattleRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BattleRepository extends JpaRepository<BattleRecord, String> {
    Page<BattleRecord> findBySeason(int season, Pageable pageable);
    Page<BattleRecord> findAllByOrderBySeasonAscNameAsc(Pageable pageable);
}
