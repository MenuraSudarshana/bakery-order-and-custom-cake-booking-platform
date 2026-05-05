package com.example.bakery_site.service;

import com.example.bakery_site.dto.UserLoginRequestDto;

public interface IUserService {

    String login(UserLoginRequestDto request);
}
