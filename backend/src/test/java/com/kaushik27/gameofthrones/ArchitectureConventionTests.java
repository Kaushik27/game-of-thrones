package com.kaushik27.gameofthrones;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ArchitectureConventionTests {
    private static final Path SOURCE_ROOT = sourceRoot();

    @Test
    void usesConventionalLayerPackages() {
        assertThat(List.of("controller", "service", "repository", "entity", "dto", "exception", "config", "util"))
                .allSatisfy(layer -> assertThat(SOURCE_ROOT.resolve(layer)).isDirectory());
    }

    @Test
    void controllersDependOnServicesInsteadOfPersistence() throws IOException {
        try (var files = Files.list(SOURCE_ROOT.resolve("controller"))) {
            files.filter(path -> path.toString().endsWith("Controller.java"))
                    .forEach(path -> assertThat(read(path))
                            .doesNotContain(".repository.", "EntityManager", "@Transactional"));
        }
    }

    @Test
    void responseRecordsLiveOutsideControllersAndServices() throws IOException {
        for (String layer : List.of("controller", "service")) {
            try (var files = Files.list(SOURCE_ROOT.resolve(layer))) {
                files.filter(path -> path.toString().endsWith(".java"))
                        .forEach(path -> assertThat(read(path)).doesNotContainPattern("\\brecord\\s+[A-Z]"));
            }
        }
    }

    private static String read(Path path) {
        try {
            return Files.readString(path);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to inspect " + path, exception);
        }
    }

    private static Path sourceRoot() {
        Path projectRelative = Path.of("src/main/java/com/kaushik27/gameofthrones");
        return Files.isDirectory(projectRelative)
                ? projectRelative
                : Path.of("backend").resolve(projectRelative);
    }
}
