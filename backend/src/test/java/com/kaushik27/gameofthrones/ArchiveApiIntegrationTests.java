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
}
