package com.kaushik27.gameofthrones.event;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface StoryEventRepository extends JpaRepository<StoryEventRecord, String> {
    List<StoryEventRecord> findAllByOrderBySeasonAscTitleAsc();
    List<StoryEventRecord> findBySeasonOrderByTitle(int season);
    List<StoryEventRecord> findByTypeIgnoreCaseOrderBySeasonAsc(String type);
    List<StoryEventRecord> findBySeasonAndTypeIgnoreCaseOrderByTitle(int season, String type);
}
