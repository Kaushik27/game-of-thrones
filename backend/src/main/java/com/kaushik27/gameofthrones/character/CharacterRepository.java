package com.kaushik27.gameofthrones.character;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

interface CharacterRepository extends JpaRepository<CharacterRecord, String> {

    Page<CharacterRecord> findByNameContainingIgnoreCaseOrActorContainingIgnoreCase(
            String name, String actor, Pageable pageable);

    Page<CharacterRecord> findByHouseIgnoreCase(String house, Pageable pageable);

    Page<CharacterRecord> findByHouseIgnoreCaseAndStatus(
            String house, CharacterStatus status, Pageable pageable);

    Page<CharacterRecord> findByStatus(CharacterStatus status, Pageable pageable);

    Page<CharacterRecord> findByHouseIgnoreCaseAndNameContainingIgnoreCaseOrHouseIgnoreCaseAndActorContainingIgnoreCase(
            String firstHouse, String name, String secondHouse, String actor, Pageable pageable);

    Page<CharacterRecord> findByStatusAndNameContainingIgnoreCaseOrStatusAndActorContainingIgnoreCase(
            CharacterStatus firstStatus, String name, CharacterStatus secondStatus, String actor, Pageable pageable);

    Page<CharacterRecord> findByHouseIgnoreCaseAndStatusAndNameContainingIgnoreCaseOrHouseIgnoreCaseAndStatusAndActorContainingIgnoreCase(
            String firstHouse, CharacterStatus firstStatus, String name,
            String secondHouse, CharacterStatus secondStatus, String actor, Pageable pageable);
}
