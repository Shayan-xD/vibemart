package com.example.demo.dto;

public class PaymentInfoDTO {
    private String method = "Stripe";
    private String paymentIntentId;
    private boolean paid;

    public PaymentInfoDTO() {}

    public PaymentInfoDTO(String paymentIntentId, boolean paid) {
        this.method = "Stripe";
        this.paymentIntentId = paymentIntentId;
        this.paid = paid;
    }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }
}