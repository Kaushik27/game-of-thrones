package com.kaushik27.gameofthrones.error;

import java.net.URI;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import com.kaushik27.gameofthrones.character.CharacterNotFoundException;
import com.kaushik27.gameofthrones.battle.BattleNotFoundException;
import com.kaushik27.gameofthrones.episode.EpisodeNotFoundException;
import com.kaushik27.gameofthrones.house.HouseNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class ApiExceptionHandler {

    @ExceptionHandler(CharacterNotFoundException.class)
    ProblemDetail handleNotFound(CharacterNotFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Character not found", exception.getMessage(), request);
    }

    @ExceptionHandler({HouseNotFoundException.class, EpisodeNotFoundException.class, BattleNotFoundException.class})
    ProblemDetail handleArchiveRecordNotFound(RuntimeException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Archive record not found", exception.getMessage(), request);
    }

    @ExceptionHandler({ConstraintViolationException.class, IllegalArgumentException.class})
    ProblemDetail handleBadRequest(Exception exception, HttpServletRequest request) {
        return problem(HttpStatus.BAD_REQUEST, "Invalid request", exception.getMessage(), request);
    }

    private ProblemDetail problem(HttpStatus status, String title, String detail, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setInstance(URI.create(request.getRequestURI()));
        return problem;
    }
}
