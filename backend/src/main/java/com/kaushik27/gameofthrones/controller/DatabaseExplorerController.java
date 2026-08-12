package com.kaushik27.gameofthrones.controller;

import com.kaushik27.gameofthrones.dto.DatabaseRecordPageResponse;
import com.kaushik27.gameofthrones.dto.DatabaseTablesResponse;
import com.kaushik27.gameofthrones.service.DatabaseExplorerService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
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

    public DatabaseExplorerController(DatabaseExplorerService service) {
        this.service = service;
    }

    @GetMapping("/tables")
    DatabaseTablesResponse findTables() {
        return service.findTables();
    }

    @GetMapping("/tables/{table}/records")
    DatabaseRecordPageResponse findRecords(
            @PathVariable @Pattern(regexp = "[a-z_]{1,40}") String table,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(25) int pageSize) {
        return service.findRecords(table, page, pageSize);
    }
}
