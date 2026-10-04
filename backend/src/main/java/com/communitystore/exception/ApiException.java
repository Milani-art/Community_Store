package com.communitystore.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base class for every "expected" error in the API.
 * Each subclass fixes the HTTP status, so services only have to say WHAT went wrong
 * and the GlobalExceptionHandler turns it into the right response.
 */
@Getter
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;

    protected ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
