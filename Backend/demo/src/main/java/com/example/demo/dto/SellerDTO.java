package com.example.demo.dto;

public class SellerDTO {
    private String company;
    private String email;
    private String status;

    public SellerDTO() {}

    public SellerDTO(String company, String email, String status) {
        this.company = company;
        this.email = email;
        this.status = status;
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
}