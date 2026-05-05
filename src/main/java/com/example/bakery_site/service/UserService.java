package com.example.bakery_site.service;

import com.example.bakery_site.dto.UserLoginRequestDto;
import com.example.bakery_site.model.User;
import com.example.bakery_site.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService implements IUserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public String login(UserLoginRequestDto request) {
        String username = clean(request.getUsername());
        String password = clean(request.getPassword());

        if (username.isEmpty() || password.isEmpty()) {
            return "FAILED";
        }

        User existingUser = userRepository.findByUsernameAndPassword(username, password);
        return existingUser != null ? "SUCCESS" : "FAILED";
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
