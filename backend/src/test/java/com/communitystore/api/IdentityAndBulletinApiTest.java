package com.communitystore.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests: the whole application starts (security filters, controllers, services, JPA)
 * against an in-memory H2 database, and MockMvc sends real HTTP-style requests through it.
 * The seed accounts from DataInitializer are available.
 *
 * Note: MockMvc paths do NOT include the /api context path.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IdentityAndBulletinApiTest {

    private static final String STUDENT = "student@campus.ac.za";
    private static final String VENDOR = "vendor@campusbooks.co.za";
    private static final String ADMIN = "admin@communitystore.org";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    // ---------- helpers ----------

    private String bearer(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return "Bearer " + body.path("data").path("token").asText();
    }

    private JsonNode dataOf(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
    }

    private String registerBody(String email, String role) {
        return """
                {"email":"%s","password":"password123","fullName":"Test Person","role":"%s","institutionOrBusiness":"Somewhere"}
                """.formatted(email, role);
    }

    private static final String POST_BODY = """
            {"title":"Textbook swap","content":"Bring your old books.","postType":"EVENT","tags":"Books","eventDate":"2026-10-05T14:30"}
            """;

    // ---------- registration and login ----------

    @Test
    void register_studentWithUniversityEmail_isCreatedAndAutoVerified() throws Exception {
        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("New.Student@campus.ac.za", "STUDENT")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("new.student@campus.ac.za"))
                .andExpect(jsonPath("$.data.verified").value(true))
                .andExpect(jsonPath("$.data.verificationStatus").value("APPROVED"));
    }

    @Test
    void register_asAdmin_isRejected() throws Exception {
        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("sneaky@campus.ac.za", "ADMIN")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void register_withExistingEmail_isConflict() throws Exception {
        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(STUDENT, "STUDENT")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    @Test
    void register_withMissingFields_returnsFieldErrors() throws Exception {
        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.email").exists())
                .andExpect(jsonPath("$.data.password").exists())
                .andExpect(jsonPath("$.data.fullName").exists());
    }

    @Test
    void login_withWrongPassword_isUnauthorized() throws Exception {
        mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"wrong-password\"}".formatted(STUDENT)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    // ---------- profile ----------

    @Test
    void me_withoutToken_isUnauthorized() throws Exception {
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void me_withToken_returnsOwnProfile() throws Exception {
        mockMvc.perform(get("/users/me").header("Authorization", bearer(STUDENT, "password123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(STUDENT))
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    void updateProfile_changesName() throws Exception {
        String token = bearer(VENDOR, "password123");

        mockMvc.perform(put("/users/me").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Campus Supplies (Pty) Ltd\",\"institutionOrBusiness\":\"Reg No: 2024/88921/07\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Campus Supplies (Pty) Ltd"));
    }

    // ---------- admin rules ----------

    @Test
    void pendingVerifications_asStudent_isForbidden() throws Exception {
        mockMvc.perform(get("/users/pending-verification").header("Authorization", bearer(STUDENT, "password123")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void pendingVerifications_asAdmin_isOk() throws Exception {
        mockMvc.perform(get("/users/pending-verification").header("Authorization", bearer(ADMIN, "admin123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    // ---------- the whole verification story, start to finish ----------

    @Test
    void verificationFlow_rejectThenReapplyThenApprove() throws Exception {
        String email = "flow.resident@community.org";
        String adminToken = bearer(ADMIN, "admin123");

        // 1. A resident registers: not a university email, so they start as PENDING.
        MvcResult registered = mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(email, "RESIDENT")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.verificationStatus").value("PENDING"))
                .andReturn();
        int userId = dataOf(registered).path("id").asInt();
        String residentToken = bearer(email, "password123");

        // 2. Unverified users cannot post on the bulletin board.
        mockMvc.perform(post("/bulletin").header("Authorization", residentToken)
                        .contentType(MediaType.APPLICATION_JSON).content(POST_BODY))
                .andExpect(status().isForbidden());

        // 3. The admin rejects them with a reason, which the user can see on their profile.
        mockMvc.perform(put("/users/" + userId + "/reject").header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Proof of address missing\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/users/me").header("Authorization", residentToken))
                .andExpect(jsonPath("$.data.verificationStatus").value("REJECTED"))
                .andExpect(jsonPath("$.data.verificationNote").value("Proof of address missing"));

        // 4. The user re-applies and goes back into the queue.
        mockMvc.perform(post("/users/me/request-verification").header("Authorization", residentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verificationStatus").value("PENDING"));

        // 5. The admin approves, and now posting works.
        mockMvc.perform(put("/users/" + userId + "/verify").header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verified").value(true));
        mockMvc.perform(post("/bulletin").header("Authorization", residentToken)
                        .contentType(MediaType.APPLICATION_JSON).content(POST_BODY))
                .andExpect(status().isCreated());
    }

    // ---------- bulletin ----------

    @Test
    void bulletin_listIsPublic_butMineNeedsLogin() throws Exception {
        mockMvc.perform(get("/bulletin")).andExpect(status().isOk());
        mockMvc.perform(get("/bulletin").param("type", "EVENT")).andExpect(status().isOk());
        mockMvc.perform(get("/bulletin").param("type", "PARTY")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/bulletin/mine")).andExpect(status().isUnauthorized());
    }

    @Test
    void bulletin_createWithBlankTitle_isBadRequest() throws Exception {
        mockMvc.perform(post("/bulletin").header("Authorization", bearer(STUDENT, "password123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"content\":\"Something\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.title").exists());
    }

    @Test
    void bulletin_ownershipRules_authorEdits_adminModerates() throws Exception {
        String studentToken = bearer(STUDENT, "password123");
        String vendorToken = bearer(VENDOR, "password123");
        String adminToken = bearer(ADMIN, "admin123");

        // The student creates a post.
        MvcResult created = mockMvc.perform(post("/bulletin").header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON).content(POST_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.postType").value("EVENT"))
                .andReturn();
        int postId = dataOf(created).path("id").asInt();

        // Anyone can read it, and it shows up under the student's own posts.
        mockMvc.perform(get("/bulletin/" + postId)).andExpect(status().isOk());
        mockMvc.perform(get("/bulletin/mine").header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(postId));

        // Another user can neither edit nor delete it.
        mockMvc.perform(put("/bulletin/" + postId).header("Authorization", vendorToken)
                        .contentType(MediaType.APPLICATION_JSON).content(POST_BODY))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/bulletin/" + postId).header("Authorization", vendorToken))
                .andExpect(status().isForbidden());

        // The author can edit it.
        mockMvc.perform(put("/bulletin/" + postId).header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Textbook swap (moved)\",\"content\":\"Now on Monday.\",\"postType\":\"ANNOUNCEMENT\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Textbook swap (moved)"));

        // An admin can remove it, after which it is gone.
        mockMvc.perform(delete("/bulletin/" + postId).header("Authorization", adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/bulletin/" + postId)).andExpect(status().isNotFound());
    }
}
