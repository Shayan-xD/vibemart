package com.example.demo.dto;

public class SellerResponseDTO {
    private Long id;
    private String company;
    private String email;
    private String status;

    public SellerResponseDTO() {}

    public SellerResponseDTO(Long id, String company, String email, String status) {
        this.id = id;
        this.company = company;
        this.email = email;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Getters and setters omitted for brevity
}