package com.kaushik27.gameofthrones.service;

import java.util.List;
import java.util.Map;

import com.kaushik27.gameofthrones.dto.DatabaseRecordPageResponse;
import com.kaushik27.gameofthrones.dto.DatabaseColumn;
import com.kaushik27.gameofthrones.dto.DatabaseTable;
import com.kaushik27.gameofthrones.dto.DatabaseTablesResponse;
import com.kaushik27.gameofthrones.exception.DatabaseTableNotFoundException;
import com.kaushik27.gameofthrones.repository.DatabaseExplorerRepository;
import com.kaushik27.gameofthrones.repository.DatabaseTableMetadata;
import com.kaushik27.gameofthrones.util.PageLinksFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DatabaseExplorerService {
    private final DatabaseExplorerRepository repository;
    private final PageLinksFactory pageLinksFactory;

    public DatabaseExplorerService(DatabaseExplorerRepository repository, PageLinksFactory pageLinksFactory) {
        this.repository = repository;
        this.pageLinksFactory = pageLinksFactory;
    }

    public DatabaseTablesResponse findTables() {
        List<DatabaseTable> tables = repository.findTables().stream().map(this::toTable).toList();
        return new DatabaseTablesResponse(tables, tables.size());
    }

    public DatabaseRecordPageResponse findRecords(String table, int page, int pageSize) {
        var metadata = repository.findTable(table);
        if (metadata == null) throw new DatabaseTableNotFoundException(table);
        DatabaseTable tableMetadata = toTable(metadata);
        int pagesCount = (int) Math.ceil((double) tableMetadata.recordCount() / pageSize);
        List<Map<String, Object>> records = repository.findRecords(tableMetadata.name(), page, pageSize);
        return new DatabaseRecordPageResponse(tableMetadata.name(), records, tableMetadata.recordCount(), page, pageSize,
                pagesCount, pageLinksFactory.create(page, pagesCount));
    }

    private DatabaseTable toTable(DatabaseTableMetadata metadata) {
        return new DatabaseTable(metadata.name(), metadata.displayName(), metadata.recordCount(),
                metadata.columns().stream().map(column -> new DatabaseColumn(column.name(), column.type())).toList());
    }
}
