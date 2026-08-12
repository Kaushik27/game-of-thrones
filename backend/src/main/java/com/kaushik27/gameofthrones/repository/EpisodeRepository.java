package com.kaushik27.gameofthrones.repository;

import com.kaushik27.gameofthrones.entity.EpisodeRecord;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EpisodeRepository extends JpaRepository<EpisodeRecord, String> {
    Page<EpisodeRecord> findBySeason(int season, Pageable pageable);
    Page<EpisodeRecord> findByTitleContainingIgnoreCase(String query, Pageable pageable);
    Page<EpisodeRecord> findBySeasonAndTitleContainingIgnoreCase(int season, String query, Pageable pageable);
}
