package com.kaushik27.gameofthrones.quote;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

interface QuoteRepository extends JpaRepository<QuoteRecord, String> {
    @Override @EntityGraph(attributePaths = "character") Page<QuoteRecord> findAll(Pageable pageable);
    @EntityGraph(attributePaths = "character") Page<QuoteRecord> findBySeason(int season, Pageable pageable);
    @EntityGraph(attributePaths = "character") Page<QuoteRecord> findByCharacterHouseIgnoreCase(String house, Pageable pageable);
    @EntityGraph(attributePaths = "character") Page<QuoteRecord> findBySeasonAndCharacterHouseIgnoreCase(int season, String house, Pageable pageable);
}
