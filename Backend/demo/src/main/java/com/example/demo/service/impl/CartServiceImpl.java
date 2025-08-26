package com.example.demo.service.impl;

import com.example.demo.dto.CartDTO;
import com.example.demo.dto.CartItemDTO;
import com.example.demo.model.Cart;
import com.example.demo.model.CartItem;
import com.example.demo.repository.CartRepository;
import com.example.demo.service.CartService;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;

    public CartServiceImpl(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Override
    @Transactional
    public CartDTO addItemToCart(String userEmail, CartItemDTO newItemDTO) {
        Cart cart = cartRepository.findByUserEmail(userEmail).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserEmail(userEmail);
            newCart.setCartItems(new ArrayList<>());
            return newCart;
        });

        Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                .filter(ci -> ci.getProductId().equals(newItemDTO.getProductId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + newItemDTO.getQuantity());
        } else {
            CartItem newItem = new CartItem(
                    newItemDTO.getProductId(),
                    newItemDTO.getName(),
                    newItemDTO.getPrice(),
                    newItemDTO.getQuantity(),
                    newItemDTO.getImage(),
                    newItemDTO.getAddedAt()
            );
            cart.getCartItems().add(newItem);
        }
        cartRepository.save(cart);
        return toDTO(cart);
    }

    @Override
    @Transactional
    public CartDTO updateItemQuantity(String userEmail, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserEmail(userEmail).orElseThrow(() -> new RuntimeException("Cart not found"));
        List<CartItem> updatedItems = new ArrayList<>();
        for (CartItem item : cart.getCartItems()) {
            if (item.getProductId().equals(productId)) {
                if (quantity > 0) {
                    item.setQuantity(quantity);
                    updatedItems.add(item);
                }
                // if quantity <=0 item is removed by skipping
            } else {
                updatedItems.add(item);
            }
        }
        cart.setCartItems(updatedItems);
        cartRepository.save(cart);
        return toDTO(cart);
    }

    @Override
    @Transactional
    public CartDTO removeItemFromCart(String userEmail, Long productId) {
        Cart cart = cartRepository.findByUserEmail(userEmail).orElseThrow(() -> new RuntimeException("Cart not found"));
        cart.setCartItems(cart.getCartItems().stream()
                .filter(item -> !item.getProductId().equals(productId))
                .collect(Collectors.toList()));
        cartRepository.save(cart);
        return toDTO(cart);
    }

    @Override
    @Transactional
    public void clearCart(String userEmail) {
        Cart cart = cartRepository.findByUserEmail(userEmail).orElse(null);
        if (cart != null) {
            cart.setCartItems(new ArrayList<>());
            cartRepository.save(cart);
        }
    }

    @Override
    @Transactional
    public void clearAllCarts() {
        cartRepository.deleteAll();
    }

    @Override
    public CartDTO getCartByUserEmail(String userEmail) {
        Optional<Cart> cartOpt = cartRepository.findByUserEmail(userEmail);
        return cartOpt.map(this::toDTO).orElse(null);
    }

    private CartDTO toDTO(Cart cart) {
        List<CartItemDTO> dtos = cart.getCartItems().stream().map(item -> {
            CartItemDTO dto = new CartItemDTO();
            dto.setProductId(item.getProductId());
            dto.setName(item.getName());
            dto.setPrice(item.getPrice());
            dto.setQuantity(item.getQuantity());
            dto.setImage(item.getImage());
            dto.setAddedAt(item.getAddedAt());
            return dto;
        }).collect(Collectors.toList());

        CartDTO cartDTO = new CartDTO();
        cartDTO.setUserEmail(cart.getUserEmail());
        cartDTO.setCartItems(dtos);
        return cartDTO;
    }
}
