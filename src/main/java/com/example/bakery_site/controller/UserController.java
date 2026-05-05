package com.example.bakery_site.controller;

import com.example.bakery_site.dto.UserLoginRequestDto;
import com.example.bakery_site.service.IUserService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/users")
public class UserController {

    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public String login(@RequestBody UserLoginRequestDto request) {
        return userService.login(request);
    }
}
