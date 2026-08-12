package com.kaushik27.gameofthrones.character;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:character-api;DB_CLOSE_DELAY=-1")
class CharacterApiIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void returnsPaginatedCharacterRecords() throws Exception {
        mockMvc.perform(get("/api/v1/characters").param("pageSize", "5"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(header().string("Link", "<http://localhost/api/v1/characters>; rel=\"self\""))
                .andExpect(jsonPath("$.items", hasSize(5)))
                .andExpect(jsonPath("$.itemsCount").value(196))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.pageSize").value(5));
    }

    @Test
    void filtersCharactersAcrossHouseStatusAndSearch() throws Exception {
        mockMvc.perform(get("/api/v1/characters")
                        .param("house", "Stark")
                        .param("status", "ALIVE")
                        .param("query", "Sansa"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].id").value("sansa-stark"));
    }

    @Test
    void returnsProblemDetailsForUnknownCharacter() throws Exception {
        mockMvc.perform(get("/api/v1/characters/not-a-character"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Character not found"))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void rejectsPageSizesAboveTheServerLimit() throws Exception {
        mockMvc.perform(get("/api/v1/characters").param("pageSize", "101"))
                .andExpect(status().isBadRequest());
    }
}
