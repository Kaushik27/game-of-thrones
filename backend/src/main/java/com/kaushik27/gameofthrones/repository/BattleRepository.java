package com.kaushik27.gameofthrones.repository;

import java.util.List;
import com.kaushik27.gameofthrones.entity.BattleRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BattleRepository extends JpaRepository<BattleRecord, String> {
    List<BattleRecord> findBySeasonOrderByName(int season);
    List<BattleRecord> findAllByOrderBySeasonAscNameAsc();
}
