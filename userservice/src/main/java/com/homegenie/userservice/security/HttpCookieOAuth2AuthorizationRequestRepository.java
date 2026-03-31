package com.homegenie.userservice.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Stores OAuth2 authorization request data in a browser cookie using compact JSON.
 * Unlike Java serialization (which is fragile and produces large payloads),
 * this approach stores only the essential fields needed to validate the callback.
 *
 * This is required for stateless platforms like Google Cloud Run where
 * HTTP sessions don't survive across container instances.
 */
@Component
@Slf4j
public class HttpCookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String COOKIE_NAME = "oauth2_auth_request";
    private static final int COOKIE_EXPIRE_SECONDS = 300; // 5 minutes
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookieValue(request);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                          HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeCookie(request, response);
            return;
        }

        // Store only essential fields as a compact JSON map
        Map<String, String> data = new HashMap<>();
        data.put("authorizationUri", authorizationRequest.getAuthorizationUri());
        data.put("clientId", authorizationRequest.getClientId());
        data.put("redirectUri", authorizationRequest.getRedirectUri());
        data.put("state", authorizationRequest.getState());
        data.put("grantType", authorizationRequest.getGrantType().getValue());

        // Store scopes as comma-separated
        if (authorizationRequest.getScopes() != null) {
            data.put("scopes", String.join(",", authorizationRequest.getScopes()));
        }

        try {
            String json = objectMapper.writeValueAsString(data);
            String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes());
            log.debug("Saving OAuth2 auth request to cookie, encoded length: {}", encoded.length());

            // Use Set-Cookie header directly to support SameSite attribute
            String cookieValue = String.format(
                    "%s=%s; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=%d",
                    COOKIE_NAME, encoded, COOKIE_EXPIRE_SECONDS);
            response.addHeader("Set-Cookie", cookieValue);
        } catch (Exception e) {
            log.error("Failed to serialize OAuth2AuthorizationRequest to cookie", e);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                   HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = loadAuthorizationRequest(request);
        if (authRequest != null) {
            removeCookie(request, response);
        }
        return authRequest;
    }

    private OAuth2AuthorizationRequest getCookieValue(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            log.debug("No cookies found in request");
            return null;
        }

        for (Cookie cookie : cookies) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                try {
                    String decoded = new String(Base64.getUrlDecoder().decode(cookie.getValue()));
                    Map<String, String> data = objectMapper.readValue(decoded,
                            new TypeReference<Map<String, String>>() {});

                    log.debug("Successfully loaded OAuth2 auth request from cookie, state: {}",
                            data.get("state"));

                    // Reconstruct the OAuth2AuthorizationRequest from the stored fields
                    OAuth2AuthorizationRequest.Builder builder = OAuth2AuthorizationRequest.authorizationCode()
                            .authorizationUri(data.get("authorizationUri"))
                            .clientId(data.get("clientId"))
                            .redirectUri(data.get("redirectUri"))
                            .state(data.get("state"));

                    if (data.containsKey("scopes") && data.get("scopes") != null) {
                        builder.scopes(java.util.Set.of(data.get("scopes").split(",")));
                    }

                    return builder.build();
                } catch (Exception e) {
                    log.error("Failed to deserialize OAuth2AuthorizationRequest from cookie: {}", e.getMessage());
                    return null;
                }
            }
        }

        log.debug("OAuth2 auth request cookie not found");
        return null;
    }

    private void removeCookie(HttpServletRequest request, HttpServletResponse response) {
        String cookieValue = String.format(
                "%s=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
                COOKIE_NAME);
        response.addHeader("Set-Cookie", cookieValue);
    }
}
