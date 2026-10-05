package com.communitystore.exception;

import org.springframework.http.HttpStatus;

/** 403 - the user is logged in but is not allowed to do this. */
public class ForbiddenException extends ApiException {

    public ForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
