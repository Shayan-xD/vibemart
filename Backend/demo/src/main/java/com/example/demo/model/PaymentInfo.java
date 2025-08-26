package com.example.demo.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class PaymentInfo {
    private String method = "Stripe";
    private String paymentIntentId;
    private boolean paid;

    public PaymentInfo() {}

    public PaymentInfo(String paymentIntentId, boolean paid) {
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