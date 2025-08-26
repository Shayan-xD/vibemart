package com.example.demo.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class CartItem {

    private Long productId;
    private String name;
    private double price;
    private int quantity;
    private String image;
    private String addedAt;

    public CartItem() {}

    public CartItem(Long productId, String name, double price, int quantity, String image, String addedAt) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.image = image;
        this.addedAt = addedAt;
    }

    // Getters and setters below
    public Long getProductId() {
        return productId;
    }
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public double getPrice() {
        return price;
    }
    public void setPrice(double price) {
        this.price = price;
    }
    public int getQuantity() {
        return quantity;
    }
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    public String getImage() {
        return image;
    }
    public void setImage(String image) {
        this.image = image;
    }
    public String getAddedAt() {
        return addedAt;
    }
    public void setAddedAt(String addedAt) {
        this.addedAt = addedAt;
    }
}
