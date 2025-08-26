package com.example.demo.dto;

import jakarta.validation.constraints.*;

public class PaymentRequestDTO {
    @Positive(message = "Amount must be positive")
    private double amount;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotBlank(message = "Order ID is required")
    private String orderId;

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
}