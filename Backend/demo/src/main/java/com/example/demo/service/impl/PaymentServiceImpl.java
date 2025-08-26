package com.example.demo.service.impl;

import com.example.demo.dto.PaymentRequestDTO;
import com.example.demo.dto.PaymentResponseDTO;
import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;
import com.example.demo.service.OrderService;
import com.example.demo.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentServiceImpl implements PaymentService {
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    public PaymentServiceImpl(OrderService orderService, OrderRepository orderRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional
    public PaymentResponseDTO createPaymentIntent(PaymentRequestDTO request) {
        try {
            System.out.println("Creating PaymentIntent for orderId: " + request.getOrderId() + ", amount: " + request.getAmount() + ", currency: " + request.getCurrency());

            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> {
                        System.out.println("Order not found for ID: " + request.getOrderId());
                        return new IllegalArgumentException("Order not found: " + request.getOrderId());
                    });

            // Ensure PaymentInfo is initialized
            if (order.getPaymentInfo() == null) {
                System.out.println("PaymentInfo is null for orderId: " + request.getOrderId() + ", initializing");
                order.setPaymentInfo(new com.example.demo.model.PaymentInfo(null, false));
                order.getPaymentInfo().setMethod("Stripe");
            }

            Map<String, String> metadata = new HashMap<>();
            metadata.put("order_id", request.getOrderId());
            metadata.put("user_email", order.getUserEmail());
            metadata.put("total_amount", String.valueOf(request.getAmount()));

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) (request.getAmount() * 100))
                    .setCurrency(request.getCurrency().toLowerCase())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .putAllMetadata(metadata)
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Save PaymentIntent ID to order
            order.getPaymentInfo().setPaymentIntentId(paymentIntent.getId());
            Order savedOrder = orderRepository.save(order);

            System.out.println("PaymentIntent created successfully - OrderId: " + request.getOrderId() + ", PaymentIntentId: " + paymentIntent.getId() + ", Status: " + paymentIntent.getStatus());

            return new PaymentResponseDTO(paymentIntent.getClientSecret(), request.getOrderId());
        } catch (StripeException e) {
            System.out.println("Stripe error while creating PaymentIntent for orderId: " + request.getOrderId() + ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to create PaymentIntent: " + e.getMessage(), e);
        } catch (Exception e) {
            System.out.println("Unexpected error while creating PaymentIntent for orderId: " + request.getOrderId() + ". Error: " + e.getMessage());
            throw new RuntimeException("Failed to create PaymentIntent: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        System.out.println("=== WEBHOOK RECEIVED ===");
        System.out.println("Payload length: " + payload.length());
        System.out.println("Signature present: " + (sigHeader != null));

        // Print first 200 chars of payload to see what's coming
        System.out.println("Payload preview: " + (payload.length() > 200 ? payload.substring(0, 200) + "..." : payload));

        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            System.out.println("Webhook event verified - Type: " + event.getType() + ", ID: " + event.getId());

            // Debug line to see the raw event data
            System.out.println("Event data object type: " + event.getData().getObject().getClass().getSimpleName());

            switch (event.getType()) {
                case "payment_intent.succeeded":
                    System.out.println("Processing payment_intent.succeeded event");
                    handlePaymentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    System.out.println("Processing payment_intent.payment_failed event");
                    handlePaymentFailed(event);
                    break;
                case "payment_intent.requires_action":
                    System.out.println("Processing payment_intent.requires_action event");
                    handlePaymentRequiresAction(event);
                    break;
                default:
                    System.out.println("Unhandled webhook event type: " + event.getType());
            }
        } catch (SignatureVerificationException e) {
            System.out.println("Webhook signature verification failed: " + e.getMessage());
            throw new RuntimeException("Webhook signature verification failed", e);
        } catch (Exception e) {
            System.out.println("Webhook handling failed: " + e.getMessage());
            e.printStackTrace(); // This will show the full stack trace
            throw new RuntimeException("Webhook handling failed: " + e.getMessage(), e);
        }
    }

    private void handlePaymentSucceeded(Event event) {
        System.out.println("=== STARTING PAYMENT SUCCEEDED HANDLER ===");

        try {
            // Use the raw data approach instead of getDataObjectDeserializer
            PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();

            if (paymentIntent == null) {
                System.out.println("ERROR: PaymentIntent is null in event data");
                throw new IllegalStateException("PaymentIntent not found in event");
            }

            String orderId = paymentIntent.getMetadata().get("order_id");
            System.out.println("Extracted orderId from metadata: " + orderId);

            if (orderId == null) {
                System.out.println("ERROR: No order_id found in PaymentIntent metadata!");
                System.out.println("Available metadata keys: " + paymentIntent.getMetadata().keySet());
                throw new IllegalStateException("No order_id found in PaymentIntent metadata");
            }

            System.out.println("Processing payment success - OrderId: " + orderId + ", PaymentIntentId: " + paymentIntent.getId() + ", Amount: " + paymentIntent.getAmount());

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> {
                        System.out.println("ERROR: Order not found for ID: " + orderId);
                        return new IllegalArgumentException("Order not found: " + orderId);
                    });

            System.out.println("Found order. Current status: " + order.getStatus() + ", Paid: " + (order.getPaymentInfo() != null ? order.getPaymentInfo().isPaid() : "null"));

            // Update payment info
            if (order.getPaymentInfo() == null) {
                System.out.println("Creating new PaymentInfo for order");
                order.setPaymentInfo(new com.example.demo.model.PaymentInfo());
            }

            order.getPaymentInfo().setPaymentIntentId(paymentIntent.getId());
            order.getPaymentInfo().setPaid(true);
            order.getPaymentInfo().setMethod("Stripe");

            // Update order status to confirm
            if (!"confirmed".equals(order.getStatus())) {
                System.out.println("Updating order status from '" + order.getStatus() + "' to 'confirmed'");
                order.setStatus("confirmed");
            }

            order.setUpdatedAt(LocalDateTime.now());
            Order savedOrder = orderRepository.save(order);

            System.out.println("SUCCESS: Order updated - Paid: " + savedOrder.getPaymentInfo().isPaid() + ", Status: " + savedOrder.getStatus());
            System.out.println("PaymentIntentId: " + savedOrder.getPaymentInfo().getPaymentIntentId());

        } catch (Exception e) {
            System.out.println("ERROR in handlePaymentSucceeded: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private void handlePaymentFailed(Event event) {
        try {
            PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();

            if (paymentIntent == null) {
                throw new IllegalStateException("PaymentIntent not found in event");
            }

            String orderId = paymentIntent.getMetadata().get("order_id");
            if (orderId == null) {
                System.out.println("No order_id found in PaymentIntent metadata for payment failure");
                return;
            }

            System.out.println("Processing payment failure - OrderId: " + orderId + ", PaymentIntentId: " + paymentIntent.getId());

            // Update order directly in repository for immediate consistency
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
                order.setStatus("failed");
                order.setUpdatedAt(LocalDateTime.now());
                orderRepository.save(order);
                System.out.println("Order status updated to 'failed' for orderId: " + orderId);
            } else {
                System.out.println("Order not found for failed payment: " + orderId);
            }

        } catch (Exception e) {
            System.out.println("Error handling payment failure: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private void handlePaymentRequiresAction(Event event) {
        try {
            PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();

            if (paymentIntent == null) {
                throw new IllegalStateException("PaymentIntent not found in event");
            }

            String orderId = paymentIntent.getMetadata().get("order_id");
            if (orderId == null) {
                System.out.println("No order_id found in PaymentIntent metadata for requires_action");
                return;
            }

            System.out.println("Processing payment requires action - OrderId: " + orderId + ", PaymentIntentId: " + paymentIntent.getId());

            // Update order directly in repository for immediate consistency
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
                order.setStatus("requires_action");
                order.setUpdatedAt(LocalDateTime.now());
                orderRepository.save(order);
                System.out.println("Order status updated to 'requires_action' for orderId: " + orderId);
            } else {
                System.out.println("Order not found for requires_action payment: " + orderId);
            }

        } catch (Exception e) {
            System.out.println("Error handling payment requires action: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}