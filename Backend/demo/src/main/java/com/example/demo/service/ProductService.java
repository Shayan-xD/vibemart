package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductResponseDTO;

import java.util.List;

public interface ProductService {
    ProductResponseDTO addProduct(ProductDTO productDTO);
    void deleteProduct(Long id);
    ProductResponseDTO updateProduct(Long id, ProductDTO productDTO);
    void reduceProductQuantity(Long productId, int quantity);
    void increaseProductQuantity(Long productId, int quantity); // Add this line
    List<ProductResponseDTO> getAllProducts();
    ProductResponseDTO getProductById(Long id);
}
