package com.kaushik27.gameofthrones.common;

import java.util.List;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class JsonCollections {

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() { };
    private final ObjectMapper objectMapper;

    public JsonCollections(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<String> strings(String value) {
        return read(value, STRING_LIST);
    }

    public <T> List<T> read(String value, TypeReference<List<T>> type) {
        try {
            return List.copyOf(objectMapper.readValue(value, type));
        } catch (JacksonException exception) {
            throw new IllegalStateException("Persisted archive JSON is invalid", exception);
        }
    }
}
