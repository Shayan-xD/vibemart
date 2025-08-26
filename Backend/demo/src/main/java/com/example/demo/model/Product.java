package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String category;

    private String subCategory;

    private String price;

    private String image;

    @ElementCollection
    @CollectionTable(name = "product_lifestyle_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> lifestyleImages;

    private int stockQuantity;

    private String feature;

    @Column(columnDefinition = "TEXT") // Ensure description supports longer text
    private String description; // Changed from Description to description

    private String sellerEmail;

    private LocalDateTime createdAt;

    public Product() {}

    public Product(Long id, String name, String category, String subCategory, String price,
                   String image, List<String> lifestyleImages, int stockQuantity, LocalDateTime createdAt) {
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

    public Product(Long id, String name, String category, String subCategory, String price, String image,
                   List<String> lifestyleImages, int stockQuantity, String feature, String description,String sellerEmail, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.subCategory = subCategory;
        this.price = price;
        this.image = image;
        this.lifestyleImages = lifestyleImages;
        this.stockQuantity = stockQuantity;
        this.feature = feature;
        this.description = description; // Updated
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public String getDescription() {
        return description; // Updated
    }

    public void setDescription(String description) {
        this.description = description; // Updated
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", category='" + category + '\'' +
                ", subCategory='" + subCategory + '\'' +
                ", price='" + price + '\'' +
                ", image='" + image + '\'' +
                ", lifestyleImages=" + lifestyleImages +
                ", stockQuantity=" + stockQuantity +
                ", feature='" + feature + '\'' +
                ", description='" + description + '\'' +
                ", sellerEmail='" + sellerEmail + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}