package com.homegenie.userservice.service;

import com.homegenie.userservice.dto.AuthResponse;
import com.homegenie.userservice.dto.LoginRequest;
import com.homegenie.userservice.dto.RegisterRequest;
import com.homegenie.userservice.dto.UserResponse;
import com.homegenie.userservice.exception.AuthenticationException;
import com.homegenie.userservice.exception.DuplicateResourceException;
import com.homegenie.userservice.exception.ResourceNotFoundException;
import com.homegenie.userservice.model.User;
import com.homegenie.userservice.model.UserRole;
import com.homegenie.userservice.repository.UserRepository;
import com.homegenie.userservice.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPassword("encoded_password");
        testUser.setFullName("Test User");
        testUser.setPhoneNumber("1234567890");
        testUser.setFlatNumber("A-101");
        testUser.setRole(UserRole.RESIDENT);
        testUser.setActive(true);
        testUser.setEmailNotificationsEnabled(true);

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Test User");
        registerRequest.setPhoneNumber("1234567890");
        registerRequest.setFlatNumber("A-101");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Nested
    @DisplayName("Registration Tests")
    class RegistrationTests {

        @Test
        @DisplayName("Should register user successfully")
        void register_Success() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("jwt_token");

            AuthResponse response = userService.register(registerRequest);

            assertThat(response.getToken()).isEqualTo("jwt_token");
            assertThat(response.getEmail()).isEqualTo("test@example.com");
            assertThat(response.getFullName()).isEqualTo("Test User");
            assertThat(response.getRole()).isEqualTo("RESIDENT");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw DuplicateResourceException when email exists")
        void register_EmailExists() {
            when(userRepository.existsByEmail(anyString())).thenReturn(true);

            assertThatThrownBy(() -> userService.register(registerRequest))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("Email already registered");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should register user as technician with specialty")
        void register_Technician() {
            registerRequest.setRole("TECHNICIAN");
            registerRequest.setSpecialty("Plumbing");

            User techUser = new User();
            techUser.setId(2L);
            techUser.setEmail("tech@example.com");
            techUser.setRole(UserRole.TECHNICIAN);
            techUser.setSpecialty("Plumbing");
            techUser.setFullName("Tech User");

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            when(userRepository.save(any(User.class))).thenReturn(techUser);
            when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("token");

            AuthResponse response = userService.register(registerRequest);

            assertThat(response.getRole()).isEqualTo("TECHNICIAN");
        }

        @Test
        @DisplayName("Should default to RESIDENT for invalid role")
        void register_InvalidRole() {
            registerRequest.setRole("INVALID_ROLE");

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User saved = inv.getArgument(0);
                saved.setId(1L);
                return saved;
            });
            when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("token");

            AuthResponse response = userService.register(registerRequest);

            assertThat(response).isNotNull();
        }
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login successfully")
        void login_Success() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
            when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("jwt_token");

            AuthResponse response = userService.login(loginRequest);

            assertThat(response.getToken()).isEqualTo("jwt_token");
            assertThat(response.getEmail()).isEqualTo("test@example.com");
        }

        @Test
        @DisplayName("Should throw AuthenticationException for non-existent email")
        void login_EmailNotFound() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.login(loginRequest))
                    .isInstanceOf(AuthenticationException.class)
                    .hasMessageContaining("Invalid credentials");
        }

        @Test
        @DisplayName("Should throw AuthenticationException for wrong password")
        void login_WrongPassword() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

            assertThatThrownBy(() -> userService.login(loginRequest))
                    .isInstanceOf(AuthenticationException.class)
                    .hasMessageContaining("Invalid credentials");
        }

        @Test
        @DisplayName("Should throw AuthenticationException for deactivated account")
        void login_DeactivatedAccount() {
            testUser.setActive(false);
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

            assertThatThrownBy(() -> userService.login(loginRequest))
                    .isInstanceOf(AuthenticationException.class)
                    .hasMessageContaining("Account is deactivated");
        }
    }

    @Nested
    @DisplayName("User Retrieval Tests")
    class RetrievalTests {

        @Test
        @DisplayName("Should get user by ID")
        void getUserById_Success() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            UserResponse response = userService.getUserById(1L);

            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getEmail()).isEqualTo("test@example.com");
            assertThat(response.getFullName()).isEqualTo("Test User");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException for unknown ID")
        void getUserById_NotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("Should get all technicians")
        void getAllTechnicians() {
            User tech = new User();
            tech.setId(2L);
            tech.setEmail("tech@example.com");
            tech.setFullName("Technician");
            tech.setRole(UserRole.TECHNICIAN);
            tech.setActive(true);

            when(userRepository.findByRoleAndActive(UserRole.TECHNICIAN, true))
                    .thenReturn(List.of(tech));

            List<UserResponse> technicians = userService.getAllTechnicians();

            assertThat(technicians).hasSize(1);
            assertThat(technicians.get(0).getRole()).isEqualTo("TECHNICIAN");
        }

        @Test
        @DisplayName("Should get all users")
        void getAllUsers() {
            when(userRepository.findAll()).thenReturn(List.of(testUser));

            List<UserResponse> users = userService.getAllUsers();

            assertThat(users).hasSize(1);
        }
    }
}
