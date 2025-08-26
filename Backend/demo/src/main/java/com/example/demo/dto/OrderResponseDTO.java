package com.example.demo.dto;

import java.util.List;

public class OrderResponseDTO {
    private String orderId;
    private String userEmail;
    private List<OrderItemDTO> items;
    private double totalAmount;
    private String currency;
    private ShippingAddressDTO shippingAddress;
    private String status;
    private PaymentInfoDTO paymentInfo;
    private String createdAt;
    private String updatedAt;

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public PaymentInfoDTO getPaymentInfo() { return paymentInfo; }
    public void setPaymentInfo(PaymentInfoDTO paymentInfo) { this.paymentInfo = paymentInfo; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}