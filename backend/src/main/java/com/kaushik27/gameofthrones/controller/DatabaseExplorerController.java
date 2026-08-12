package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.DatabaseRecordPageResponse;
import com.kaushik27.gameofthrones.dto.DatabaseTablesResponse;
import com.kaushik27.gameofthrones.service.DatabaseExplorerService;
import com.kaushik27.gameofthrones.util.PageLinksFactory;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/database")
public class DatabaseExplorerController {
    private final DatabaseExplorerService service;
    private final PageLinksFactory pageLinksFactory;

    public DatabaseExplorerController(DatabaseExplorerService service, PageLinksFactory pageLinksFactory) {
        this.service = service;
        this.pageLinksFactory = pageLinksFactory;
    }

    @GetMapping("/tables")
    DatabaseTablesResponse findTables() {
        return service.findTables();
    }

    @GetMapping("/tables/{table}/records")
    ResponseEntity<DatabaseRecordPageResponse> findRecords(
            @PathVariable @Pattern(regexp = "[a-z_]{1,40}") String table,
            @RequestParam(defaultValue = "0") @Min(0) @Max(100_000) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(25) int pageSize) {
        DatabaseRecordPageResponse response = service.findRecords(table, page, pageSize);
        return ResponseEntity.ok().header("Link", pageLinksFactory.toHeader(response.links()))
                .header("Cache-Control", "public, max-age=60, stale-while-revalidate=30").body(response);
    }
}
