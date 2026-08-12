package com.kaushik27.gameofthrones;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class ArchitectureConventionTests {
    private static final JavaClasses APPLICATION_CLASSES = new ClassFileImporter()
            .importPackages("com.kaushik27.gameofthrones");

    @Test
    void controllersDoNotAccessPersistence() {
        noClasses().that().resideInAPackage("..controller..")
                .should().dependOnClassesThat().resideInAnyPackage("..repository..", "..entity..")
                .check(APPLICATION_CLASSES);
    }

    @Test
    void repositoriesOnlyExposeEntitiesAndProjections() {
        classes().that().resideInAPackage("..repository..")
                .should().onlyDependOnClassesThat().resideInAnyPackage(
                        "java..", "jakarta.persistence..", "org.springframework..",
                        "com.kaushik27.gameofthrones.entity..",
                        "com.kaushik27.gameofthrones.repository..")
                .check(APPLICATION_CLASSES);
    }

    @Test
    void entitiesRemainIndependentFromWebAndApplicationLayers() {
        noClasses().that().resideInAPackage("..entity..")
                .should().dependOnClassesThat().resideInAnyPackage("..controller..", "..service..", "..dto..")
                .check(APPLICATION_CLASSES);
    }
}
