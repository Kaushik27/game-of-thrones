package com.kaushik27.gameofthrones.house;

import org.springframework.data.jpa.repository.JpaRepository;

interface HouseRepository extends JpaRepository<HouseRecord, String> {
}
