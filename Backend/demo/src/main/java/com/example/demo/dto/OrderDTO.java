package com.example.demo.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class OrderDTO {
    @NotBlank(message = "User email is required")
    @Email(message = "Invalid email format")
    private String userEmail;

    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemDTO> items;

    @Positive(message = "Total amount must be positive")
    private double totalAmount;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotNull(message = "Shipping address is required")
    private ShippingAddressDTO shippingAddress;

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public ShippingAddressDTO getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(ShippingAddressDTO shippingAddress) { this.shippingAddress = shippingAddress; }
}