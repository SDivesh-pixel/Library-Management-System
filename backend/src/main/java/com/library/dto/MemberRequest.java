package com.library.dto;

import lombok.Data;

@Data
public class MemberRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String membershipType; // STANDARD or PREMIUM
}
