package com.odoo.assetflow.dto;

public record JwtResponse(String token, Long id, String name, String email, String role) {}
