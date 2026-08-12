package com.kaushik27.gameofthrones.repository;

import com.kaushik27.gameofthrones.entity.HouseRecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseRepository extends JpaRepository<HouseRecord, String> {
}
