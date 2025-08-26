package com.example.demo.controller;

import com.example.demo.dto.PaymentRequestDTO;
import com.example.demo.dto.PaymentResponseDTO;
import com.example.demo.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentResponseDTO> createPaymentIntent(@Valid @RequestBody PaymentRequestDTO request) {
        logger.info("Received PaymentRequestDTO: amount={}, currency={}, orderId={}",
                request.getAmount(), request.getCurrency(), request.getOrderId());

        try {
            PaymentResponseDTO response = paymentService.createPaymentIntent(request);
            logger.info("PaymentIntent created successfully for orderId: {}", request.getOrderId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to create PaymentIntent for orderId: {}", request.getOrderId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        logger.info("Received webhook with signature: {}", sigHeader);

        // Check if signature is present
        if (sigHeader == null || sigHeader.trim().isEmpty()) {
            logger.error("Missing Stripe-Signature header");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Missing Stripe-Signature header");
        }

        try {
            paymentService.handleWebhook(payload, sigHeader);
            logger.info("Webhook processed successfully");
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            logger.error("Webhook processing failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Webhook processing failed: " + e.getMessage());
        }
    }

    // Health check endpoint to verify webhook connectivity
    @GetMapping("/webhook/health")
    public ResponseEntity<String> webhookHealth() {
        return ResponseEntity.ok("Webhook endpoint is accessible");
    }

    @PostMapping("/webhook/test")
    public ResponseEntity<String> testWebhook() {
        System.out.println("=== TEST WEBHOOK CALLED ===");

        try {
            // Create a simple test event - NOTE: This will fail signature verification
            String testEventJson = """
            {
                "type": "payment_intent.succeeded",
                "id": "evt_test_123",
                "data": {
                    "object": {
                        "id": "pi_test_123",
                        "metadata": {
                            "order_id": "test-order-123",
                            "user_email": "test@example.com"
                        },
                        "amount": 1000,
                        "currency": "usd"
                    }
                }
            }
            """;

            // This is just for testing - in production, signature verification will fail
            System.out.println("WARNING: This test bypasses signature verification");
            return ResponseEntity.ok("Test endpoint available - but will fail signature verification");
        } catch (Exception e) {
            System.out.println("Test webhook failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Test failed: " + e.getMessage());
        }
    }
}