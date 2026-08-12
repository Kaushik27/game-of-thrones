package com.kaushik27.gameofthrones.repository;

import com.kaushik27.gameofthrones.entity.StoryEventRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryEventRepository extends JpaRepository<StoryEventRecord, String> {
    Page<StoryEventRecord> findAllByOrderBySeasonAscTitleAsc(Pageable pageable);
    Page<StoryEventRecord> findBySeasonOrderByTitle(int season, Pageable pageable);
    Page<StoryEventRecord> findByTypeIgnoreCaseOrderBySeasonAsc(String type, Pageable pageable);
    Page<StoryEventRecord> findBySeasonAndTypeIgnoreCaseOrderByTitle(int season, String type, Pageable pageable);
}
