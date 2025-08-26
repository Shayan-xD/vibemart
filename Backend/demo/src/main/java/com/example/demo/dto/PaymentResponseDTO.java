package com.example.demo.dto;

public class PaymentResponseDTO {
    private String clientSecret;
    private String orderId;

    public PaymentResponseDTO() {}

    public PaymentResponseDTO(String clientSecret, String orderId) {
        this.clientSecret = clientSecret;
        this.orderId = orderId;
    }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
}