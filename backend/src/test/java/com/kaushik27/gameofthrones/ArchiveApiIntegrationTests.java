package com.kaushik27.gameofthrones;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:complete-archive;DB_CLOSE_DELAY=-1")
class ArchiveApiIntegrationTests {
    @Autowired private WebApplicationContext context;
    private MockMvc mockMvc;

    @BeforeEach void setUp() { mockMvc = MockMvcBuilders.webAppContextSetup(context).build(); }

    @Test void exposesCompleteDatabaseStatistics() throws Exception {
        mockMvc.perform(get("/api/v1/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.characters").value(196)).andExpect(jsonPath("$.houses").value(12))
                .andExpect(jsonPath("$.relationships").value(437)).andExpect(jsonPath("$.episodes").value(73))
                .andExpect(jsonPath("$.quotes").value(44)).andExpect(jsonPath("$.battles").value(9))
                .andExpect(jsonPath("$.events").value(34));
    }

    @Test void exposesControlledDatabaseMetadataAndRecords() throws Exception {
        mockMvc.perform(get("/api/v1/database/tables"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemsCount").value(7))
                .andExpect(jsonPath("$.items[0].name").value("character_records"))
                .andExpect(jsonPath("$.items[0].columns[0].name").value("id"));
        mockMvc.perform(get("/api/v1/database/tables/characters/records").param("pageSize", "3"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/v1/database/tables/character_records/records").param("pageSize", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(3)))
                .andExpect(jsonPath("$.itemsCount").value(196))
                .andExpect(jsonPath("$.items[0].id").isNotEmpty())
                .andExpect(jsonPath("$.links.next").isNotEmpty());
    }

    @Test void filtersEpisodesAndReturnsTypedCollections() throws Exception {
        mockMvc.perform(get("/api/v1/episodes").param("season", "8").param("pageSize", "100"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(6)))
                .andExpect(jsonPath("$.items[0].id").value("s08e01"))
                .andExpect(jsonPath("$.items[0].themes").isArray());
    }

    @Test void joinsQuotesToCharacterRecords() throws Exception {
        mockMvc.perform(get("/api/v1/quotes").param("season", "1").param("pageSize", "100"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].characterName").isNotEmpty())
                .andExpect(jsonPath("$.items[0].house").isNotEmpty());
    }

    @Test void returnsBattlesEventsAndRelationships() throws Exception {
        mockMvc.perform(get("/api/v1/battles").param("season", "6"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.items[0].combatants").isArray());
        mockMvc.perform(get("/api/v1/events").param("season", "8"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items", hasSize(5)));
        mockMvc.perform(get("/api/v1/characters/jon-snow/relationships"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.itemsCount").isNumber())
                .andExpect(jsonPath("$.items[0].relatedCharacterName").isNotEmpty());
    }

    @Test void rejectsInvalidSeasonAtTheHttpBoundary() throws Exception {
        mockMvc.perform(get("/api/v1/episodes").param("season", "9"))
                .andExpect(status().isBadRequest());
    }

    @Test void publishesOpenApiAndOperationalEndpoints() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Game of Thrones Archive API"))
                .andExpect(jsonPath("$.paths['/api/v1/characters']").exists());
        mockMvc.perform(get("/actuator/health/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
        mockMvc.perform(get("/actuator/metrics/jvm.memory.used"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("jvm.memory.used"));
    }

    @Test void returnsStableProblemDetailsForInvalidTypes() throws Exception {
        mockMvc.perform(get("/api/v1/characters").param("status", "MISSING"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST"));
    }

    @Test void keepsProductionOnlyResourcesUnavailable() throws Exception {
        mockMvc.perform(get("/h2-console"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }
}
