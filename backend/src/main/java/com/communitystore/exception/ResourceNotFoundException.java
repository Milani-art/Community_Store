package com.communitystore.exception;

import org.springframework.http.HttpStatus;

/** 404 - the thing asked for does not exist. */
public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
