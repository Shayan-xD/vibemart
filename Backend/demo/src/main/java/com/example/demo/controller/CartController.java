package com.example.demo.controller;

import com.example.demo.dto.CartDTO;
import com.example.demo.dto.CartItemDTO;
import com.example.demo.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/{userEmail}/items")
    public ResponseEntity<CartDTO> addItemToCart(@PathVariable String userEmail, @RequestBody CartItemDTO itemDTO) {
        CartDTO updatedCart = cartService.addItemToCart(userEmail, itemDTO);
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/{userEmail}/items/{productId}")
    public ResponseEntity<CartDTO> updateItemQuantity(@PathVariable String userEmail, @PathVariable Long productId,
                                                      @RequestParam int quantity) {
        CartDTO updatedCart = cartService.updateItemQuantity(userEmail, productId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/{userEmail}/items/{productId}")
    public ResponseEntity<CartDTO> removeItemFromCart(@PathVariable String userEmail, @PathVariable Long productId) {
        CartDTO updatedCart = cartService.removeItemFromCart(userEmail, productId);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/{userEmail}")
    public ResponseEntity<Void> clearCart(@PathVariable String userEmail) {
        cartService.clearCart(userEmail);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAllCarts() {
        cartService.clearAllCarts();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userEmail}")
    public ResponseEntity<CartDTO> getCartByUserEmail(@PathVariable String userEmail) {
        CartDTO cart = cartService.getCartByUserEmail(userEmail);
        return ResponseEntity.ok(cart);
    }
}
