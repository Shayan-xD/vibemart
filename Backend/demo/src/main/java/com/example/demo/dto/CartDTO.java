package com.example.demo.dto;

import java.util.List;

public class CartDTO {
    private String userEmail;
    private List<CartItemDTO> cartItems;


    public CartDTO(String userEmail, List<CartItemDTO> cartItems) {
        this.userEmail = userEmail;
        this.cartItems = cartItems;
    }

    public CartDTO() {
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public List<CartItemDTO> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItemDTO> cartItems) {
        this.cartItems = cartItems;
    }
}