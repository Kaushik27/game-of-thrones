package com.kaushik27.gameofthrones.exception;

import java.net.URI;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
class ApiExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(CharacterNotFoundException.class)
    ProblemDetail handleNotFound(CharacterNotFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Character not found", exception.getMessage(),
                ApiErrorCode.RESOURCE_NOT_FOUND, request);
    }

    @ExceptionHandler({HouseNotFoundException.class, EpisodeNotFoundException.class, BattleNotFoundException.class})
    ProblemDetail handleArchiveRecordNotFound(RuntimeException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Archive record not found", exception.getMessage(),
                ApiErrorCode.RESOURCE_NOT_FOUND, request);
    }

    @ExceptionHandler({ConstraintViolationException.class, IllegalArgumentException.class,
            MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class})
    ProblemDetail handleBadRequest(Exception exception, HttpServletRequest request) {
        return problem(HttpStatus.BAD_REQUEST, "Invalid request", "The request contains an invalid value.",
                ApiErrorCode.INVALID_REQUEST, request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ProblemDetail handleMethodNotAllowed(HttpRequestMethodNotSupportedException exception, HttpServletRequest request) {
        return problem(HttpStatus.METHOD_NOT_ALLOWED, "Method not allowed",
                "The requested HTTP method is not supported for this resource.", ApiErrorCode.METHOD_NOT_ALLOWED, request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ProblemDetail handleMissingResource(NoResourceFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Resource not found", "The requested resource does not exist.",
                ApiErrorCode.RESOURCE_NOT_FOUND, request);
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleUnexpected(Exception exception, HttpServletRequest request) {
        LOGGER.error("Unhandled API failure requestId={} path={}",
                request.getAttribute("requestId"), request.getRequestURI(), exception);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error",
                "The request could not be completed.", ApiErrorCode.INTERNAL_ERROR, request);
    }

    private ProblemDetail problem(HttpStatus status, String title, String detail,
                                  ApiErrorCode errorCode, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setType(URI.create("https://kaushik27.github.io/game-of-thrones/problems/" + errorCode.name().toLowerCase().replace('_', '-')));
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("errorCode", errorCode.name());
        problem.setProperty("requestId", request.getAttribute("requestId"));
        return problem;
    }
}
