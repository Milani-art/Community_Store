package com.communitystore.exception;

import com.communitystore.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * One place that converts exceptions into the standard ApiResponse JSON
 * with the correct HTTP status. Controllers and services never build error responses themselves.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Our own exceptions: 400 / 403 / 404 / 409, status comes from the exception. */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException ex) {
        return build(ex.getStatus(), ex.getMessage());
    }

    /** @Valid failed on a request body. Returns every field error in "data". */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        String message = errors.isEmpty() ? "Validation failed" : errors.values().iterator().next();

        ApiResponse<Map<String, String>> body = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message(message)
                .data(errors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /** Body is not valid JSON, or a value does not fit its type (e.g. role "WIZARD"). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnreadable(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "Malformed request body or invalid field value");
    }

    /** A path or query value has the wrong type (e.g. /bulletin/abc). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return build(HttpStatus.BAD_REQUEST, "Invalid value for '" + ex.getName() + "'");
    }

    /** Wrong email or password at login. */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    /** @PreAuthorize said no (e.g. a student calling an admin endpoint). */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "You do not have permission to perform this action");
    }

    /** The database rejected the write (unique or foreign key constraint). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return build(HttpStatus.CONFLICT, "The request conflicts with existing data");
    }

    /** Everything else. Spring's own errors (404 unknown URL, 405 wrong method) keep their status. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex) {
        if (ex instanceof ErrorResponse springError) {
            return build(springError.getStatusCode(), springError.getBody().getDetail());
        }
        log.error("Unhandled exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong on our side");
    }

    private ResponseEntity<ApiResponse<Void>> build(HttpStatusCode status, String message) {
        return ResponseEntity.status(status).body(ApiResponse.error(message));
    }
}
