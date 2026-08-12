package com.kaushik27.gameofthrones.repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DatabaseExplorerRepository {
    private final JdbcTemplate jdbcTemplate;
    private final Map<String, TableSpec> tables = createTableSpecs();

    public DatabaseExplorerRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<DatabaseTableMetadata> findTables() {
        return tables.values().stream()
                .map(spec -> new DatabaseTableMetadata(spec.name(), spec.displayName(), count(spec), spec.columns()))
                .toList();
    }

    public DatabaseTableMetadata findTable(String table) {
        TableSpec spec = tables.get(table.toLowerCase());
        return spec == null ? null : new DatabaseTableMetadata(spec.name(), spec.displayName(), count(spec), spec.columns());
    }

    public List<Map<String, Object>> findRecords(String table, int page, int pageSize) {
        TableSpec spec = tableSpec(table);
        int offset = Math.multiplyExact(page, pageSize);
        return jdbcTemplate.queryForList(spec.selectSql() + " LIMIT ? OFFSET ?", pageSize, offset).stream()
                .map(this::lowerCaseKeys)
                .toList();
    }

    private Map<String, Object> lowerCaseKeys(Map<String, Object> row) {
        Map<String, Object> values = new LinkedHashMap<>();
        row.forEach((key, value) -> values.put(key.toLowerCase(), value));
        return values;
    }

    private long count(TableSpec spec) {
        Long count = jdbcTemplate.queryForObject(spec.countSql(), Long.class);
        return count == null ? 0 : count;
    }

    private TableSpec tableSpec(String table) {
        TableSpec spec = tables.get(table.toLowerCase());
        if (spec == null) throw new IllegalArgumentException("Unknown database table: " + table);
        return spec;
    }

    private static Map<String, TableSpec> createTableSpecs() {
        Map<String, TableSpec> specs = new LinkedHashMap<>();
        specs.put("character_records", new TableSpec("character_records", "Characters", "character_records",
                columns("id", "VARCHAR", "name", "VARCHAR", "house", "VARCHAR", "status", "VARCHAR", "actor", "VARCHAR", "biography", "VARCHAR", "sigil_color", "VARCHAR")));
        specs.put("houses", new TableSpec("houses", "Houses", "houses",
                columns("name", "VARCHAR", "words", "VARCHAR", "seat", "VARCHAR", "region", "VARCHAR", "sigil", "VARCHAR", "animal", "VARCHAR", "ruler_end", "VARCHAR", "sigil_color", "VARCHAR")));
        specs.put("relationships", new TableSpec("relationships", "Relationships", "relationships",
                columns("id", "BIGINT", "source_id", "VARCHAR", "target_id", "VARCHAR", "relationship_type", "VARCHAR", "subtype", "VARCHAR", "label", "VARCHAR")));
        specs.put("episodes", new TableSpec("episodes", "Episodes", "episodes",
                columns("id", "VARCHAR", "season_number", "INTEGER", "episode_number", "INTEGER", "title", "VARCHAR", "air_date", "DATE", "runtime_minutes", "INTEGER", "director", "VARCHAR", "writers_json", "CLOB", "summary", "CLOB", "themes_json", "CLOB", "character_ids_json", "CLOB", "event_ids_json", "CLOB")));
        specs.put("quotes", new TableSpec("quotes", "Quotes", "quotes",
                columns("id", "VARCHAR", "character_id", "VARCHAR", "quote_text", "CLOB", "season_number", "INTEGER")));
        specs.put("battles", new TableSpec("battles", "Battles", "battles",
                columns("id", "VARCHAR", "name", "VARCHAR", "season_number", "INTEGER", "location", "VARCHAR", "combatants_json", "CLOB", "outcome", "CLOB", "casualties", "CLOB", "linked_character_ids_json", "CLOB", "linked_event_ids_json", "CLOB")));
        specs.put("story_events", new TableSpec("story_events", "Story events", "story_events",
                columns("id", "VARCHAR", "season_number", "INTEGER", "title", "VARCHAR", "event_date", "VARCHAR", "event_type", "VARCHAR", "houses_json", "CLOB", "character_ids_json", "CLOB", "summary", "CLOB")));
        return specs;
    }

    private static List<DatabaseColumnMetadata> columns(String... values) {
        var columns = new java.util.ArrayList<DatabaseColumnMetadata>();
        for (int index = 0; index < values.length; index += 2) columns.add(new DatabaseColumnMetadata(values[index], values[index + 1]));
        return List.copyOf(columns);
    }

    private record TableSpec(String name, String displayName, String sqlTable, List<DatabaseColumnMetadata> columns) {
        String countSql() { return "SELECT COUNT(*) FROM " + sqlTable; }
        String selectSql() {
            String columnList = columns.stream().map(DatabaseColumnMetadata::name).collect(Collectors.joining(", "));
            String orderColumn = columns.get(0).name();
            return "SELECT " + columnList + " FROM " + sqlTable + " ORDER BY " + orderColumn;
        }
    }
}
