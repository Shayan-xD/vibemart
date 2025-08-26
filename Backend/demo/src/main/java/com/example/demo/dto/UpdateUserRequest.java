package com.example.demo.dto;

import com.example.demo.model.ShippingAddress;

public class UpdateUserRequest {
    private String name;
    private ShippingAddress shippingAddress;

    // Default constructor is REQUIRED
    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String name, ShippingAddress shippingAddress) {
        this.name = name;
        this.shippingAddress = shippingAddress;
    }

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ShippingAddress getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(ShippingAddress shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    @Override
    public String toString() {
        return "UpdateUserRequest{name='" + name + "', shippingAddress=" + shippingAddress + '}';
    }
}