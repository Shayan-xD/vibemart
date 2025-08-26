package com.example.demo.dto;

import com.example.demo.model.ShippingAddress;

public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String image;
    private ShippingAddress shippingAddress;

    public UserResponseDTO(Long id, String name, String email, String image, ShippingAddress shippingAddress) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.image = image;
        this.shippingAddress = shippingAddress;
    }

    public UserResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public ShippingAddress getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(ShippingAddress shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}
