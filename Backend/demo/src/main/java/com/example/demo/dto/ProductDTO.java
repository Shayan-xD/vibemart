package com.example.demo.dto;

import java.util.List;

public class ProductDTO {

    private String name;
    private String category;
    private String subCategory;
    private String price;
    private String image;
    private List<String> lifestyleImages;
    private int stockQuantity;
    private String feature;
    private String description;
    private String sellerEmail;

    public ProductDTO() {}

    public ProductDTO(String name, String category, String subCategory, String price,
                      String image, List<String> lifestyleImages, int stockQuantity) {
        this.name = name;
        this.category = category;
        this.subCategory = subCategory;
        this.price = price;
        this.image = image;
        this.lifestyleImages = lifestyleImages;
        this.stockQuantity = stockQuantity;
    }

    public ProductDTO(String name, String category, String subCategory, String price, String image,
                      String feature, String description,String sellerEmail, List<String> lifestyleImages, int stockQuantity) {
        this.name = name;
        this.category = category;
        this.subCategory = subCategory;
        this.price = price;
        this.image = image;
        this.feature = feature;
        this.description = description;
        this.sellerEmail = sellerEmail;
        this.lifestyleImages = lifestyleImages;
        this.stockQuantity = stockQuantity;
    }

    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public List<String> getLifestyleImages() { return lifestyleImages; }
    public void setLifestyleImages(List<String> lifestyleImages) { this.lifestyleImages = lifestyleImages; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getFeature() { return feature; }
    public void setFeature(String feature) { this.feature = feature; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    @Override
    public String toString() {
        return "ProductDTO{" +
                "name='" + name + '\'' +
                ", category='" + category + '\'' +
                ", subCategory='" + subCategory + '\'' +
                ", price='" + price + '\'' +
                ", image='" + image + '\'' +
                ", lifestyleImages=" + lifestyleImages +
                ", stockQuantity=" + stockQuantity +
                ", feature='" + feature + '\'' +
                ", description='" + description + '\'' +
                '}';
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }
}