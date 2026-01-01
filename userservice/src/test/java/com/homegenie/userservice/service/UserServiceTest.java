import com.homegenie.userservice.dto.LoginRequest;
import com.homegenie.userservice.dto.RegisterRequest;
import com.homegenie.userservice.dto.UserResponse;
import com.homegenie.userservice.model.User;
import com.homegenie.userservice.model.UserRole;
import com.homegenie.userservice.repository.UserRepository;
import com.homegenie.userservice.security.JwtUtil;
import com.homegenie.userservice.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User(1, "test@example.com", "encodedPassword", "Test", "User", UserRole.USER);
        registerRequest = new RegisterRequest("Test", "User", "test@example.com", "password123", "password123");
        loginRequest = new LoginRequest("test@example.com", "password123");
    }

    @Test
    void registerUser_Success() {
        when(userRepository.findByEmail(registerRequest.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserResponse response = userService.registerUser(registerRequest);

        assertNotNull(response);
        assertEquals(testUser.getEmail(), response.getEmail());
        assertEquals(testUser.getFirstName(), response.getFirstName());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_EmailAlreadyExists() {
        when(userRepository.findByEmail(registerRequest.getEmail())).thenReturn(Optional.of(testUser));

        assertThrows(ResponseStatusException.class, () -> userService.registerUser(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_PasswordsMismatch() {
        registerRequest.setConfirmPassword("wrongPassword");

        assertThrows(ResponseStatusException.class, () -> userService.registerUser(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginUser_Success() {
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testUser);
        when(jwtUtil.generateToken(testUser)).thenReturn("mockedJwtToken");

        String token = userService.loginUser(loginRequest);

        assertNotNull(token);
        assertEquals("mockedJwtToken", token);
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, times(1)).generateToken(testUser);
    }

    @Test
    void loginUser_InvalidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        assertThrows(ResponseStatusException.class, () -> userService.loginUser(loginRequest));
        verify(jwtUtil, never()).generateToken(any(User.class));
    }

    @Test
    void getUserById_Success() {
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        UserResponse response = userService.getUserById(testUser.getId());

        assertNotNull(response);
        assertEquals(testUser.getEmail(), response.getEmail());
    }

    @Test
    void getUserById_NotFound() {
        when(userRepository.findById(2)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> userService.getUserById(2));
    }

    @Test
    void getUserByEmail_Success() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        User user = userService.getUserByEmail(testUser.getEmail());

        assertNotNull(user);
        assertEquals(testUser.getEmail(), user.getEmail());
    }

    @Test
    void getUserByEmail_NotFound() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> userService.getUserByEmail("nonexistent@example.com"));
    }
}
