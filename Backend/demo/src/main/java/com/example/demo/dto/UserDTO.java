package com.example.demo.dto;

import com.example.demo.model.ShippingAddress;

public class UserDTO {
    private String name;
    private String email;
    private String password;
    private String image; // Cloudinary URL
    private ShippingAddress shippingAddress;

    public UserDTO(String name, String email, String password, String image, ShippingAddress shippingAddress) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.image = image;
        this.shippingAddress = shippingAddress;
    }

    public UserDTO() {
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
