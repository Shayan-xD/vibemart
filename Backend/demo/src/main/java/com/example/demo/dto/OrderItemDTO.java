package com.example.demo.dto;

import jakarta.validation.constraints.*;

public class OrderItemDTO {
    @Positive(message = "Product ID must be positive")
    private long productId;

    @NotBlank(message = "Product name is required")
    private String name;

    @PositiveOrZero(message = "Price must be non-negative")
    private double price;

    @Positive(message = "Quantity must be positive")
    private int quantity;

    private String image;

    public long getProductId() { return productId; }
    public void setProductId(long productId) { this.productId = productId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}