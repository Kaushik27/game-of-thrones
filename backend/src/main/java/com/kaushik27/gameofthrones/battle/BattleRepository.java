package com.kaushik27.gameofthrones.battle;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface BattleRepository extends JpaRepository<BattleRecord, String> {
    List<BattleRecord> findBySeasonOrderByName(int season);
    List<BattleRecord> findAllByOrderBySeasonAscNameAsc();
}
