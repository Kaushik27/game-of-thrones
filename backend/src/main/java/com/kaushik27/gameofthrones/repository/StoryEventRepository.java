package com.kaushik27.gameofthrones.repository;

import java.util.List;
import com.kaushik27.gameofthrones.entity.StoryEventRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryEventRepository extends JpaRepository<StoryEventRecord, String> {
    List<StoryEventRecord> findAllByOrderBySeasonAscTitleAsc();
    List<StoryEventRecord> findBySeasonOrderByTitle(int season);
    List<StoryEventRecord> findByTypeIgnoreCaseOrderBySeasonAsc(String type);
    List<StoryEventRecord> findBySeasonAndTypeIgnoreCaseOrderByTitle(int season, String type);
}
