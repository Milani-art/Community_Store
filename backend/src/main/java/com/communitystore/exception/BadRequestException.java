package com.communitystore.exception;

import org.springframework.http.HttpStatus;

/** 400 - the request itself is wrong (bad value, broken rule). */
public class BadRequestException extends ApiException {

    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
