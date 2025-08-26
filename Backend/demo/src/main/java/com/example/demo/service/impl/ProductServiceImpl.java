package com.example.demo.service.impl;

import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductResponseDTO;
import com.example.demo.mapper.ProductMapper;
import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.ProductService;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    @Override
    @Transactional
    public ProductResponseDTO addProduct(ProductDTO productDTO) {
        System.out.println("Seller Email in ProductDTO: " + productDTO.getSellerEmail());
        Product product = productMapper.toEntity(productDTO);
        System.out.println("Seller Email in Product entity before saving: " + product.getSellerEmail());
        product.setCreatedAt(LocalDateTime.now());
        product = productRepository.save(product);
        ProductResponseDTO responseDTO = productMapper.toDTO(product);
        System.out.println("Seller Email in ProductResponseDTO after saving: " + responseDTO.getSellerEmail());
        return responseDTO;
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Update all other fields as before
        product.setName(productDTO.getName());
        product.setCategory(productDTO.getCategory());
        product.setSubCategory(productDTO.getSubCategory());
        product.setPrice(productDTO.getPrice());
        product.setImage(productDTO.getImage());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setFeature(productDTO.getFeature());
        product.setDescription(productDTO.getDescription());
        product.setSellerEmail(productDTO.getSellerEmail());

        // Handle lifestyle images safely
        List<String> newLifestyleImages = productDTO.getLifestyleImages() != null ?
                new ArrayList<>(productDTO.getLifestyleImages()) : new ArrayList<>();

        // This is the key - create a NEW ArrayList but assign it properly
        product.setLifestyleImages(newLifestyleImages);

        return productMapper.toDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public synchronized void reduceProductQuantity(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public synchronized void increaseProductQuantity(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
    }

    @Override
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return productMapper.toDTO(product);
    }
}
