package com.kaushik27.gameofthrones.house;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:house-api;DB_CLOSE_DELAY=-1")
class HouseApiIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void summarizesHousesFromPersistedCharacters() throws Exception {
        mockMvc.perform(get("/api/v1/houses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemsCount", greaterThan(10)))
                .andExpect(jsonPath("$.items[?(@.name == 'Stark')].charactersCount").exists());
    }
}
