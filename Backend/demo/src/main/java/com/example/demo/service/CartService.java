package com.example.demo.service;

import com.example.demo.dto.CartDTO;
import com.example.demo.dto.CartItemDTO;

public interface CartService {

    CartDTO addItemToCart(String userEmail, CartItemDTO newItem);
    CartDTO updateItemQuantity(String userEmail, Long productId, int quantity);
    CartDTO removeItemFromCart(String userEmail, Long productId);
    void clearCart(String userEmail);
    void clearAllCarts();
    CartDTO getCartByUserEmail(String userEmail);
}
