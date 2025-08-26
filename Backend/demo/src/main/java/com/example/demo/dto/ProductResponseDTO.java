package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ProductResponseDTO {

    private Long id;
    private String name;
    private String category;
    private String subCategory;
    private String price;
    private String image;
    private List<String> lifestyleImages;
    private int stockQuantity;
    private String feature; // Added
    private String description;
    private String sellerEmail;// Added
    private LocalDateTime createdAt;

    public ProductResponseDTO() {}

    public ProductResponseDTO(Long id, String name, String category, String subCategory,
                              String price, String image, List<String> lifestyleImages,
                              int stockQuantity, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.subCategory = subCategory;
        this.price = price;
        this.image = image;
        this.lifestyleImages = lifestyleImages;
        this.stockQuantity = stockQuantity;
        this.createdAt = createdAt;
    }

    public ProductResponseDTO(Long id, String name, String category, String subCategory,
                              String price, String image, List<String> lifestyleImages,
                              int stockQuantity, String feature, String description,String sellerEmail, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.subCategory = subCategory;
        this.price = price;
        this.image = image;
        this.lifestyleImages = lifestyleImages;
        this.stockQuantity = stockQuantity;
        this.feature = feature;
        this.description = description;
        this.sellerEmail = sellerEmail;
        this.createdAt = createdAt;
    }

    // Getters and setters

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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubCategory() {
        return subCategory;
    }

    public void setSubCategory(String subCategory) {
        this.subCategory = subCategory;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public List<String> getLifestyleImages() {
        return lifestyleImages;
    }

    public void setLifestyleImages(List<String> lifestyleImages) {
        this.lifestyleImages = lifestyleImages;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }
}