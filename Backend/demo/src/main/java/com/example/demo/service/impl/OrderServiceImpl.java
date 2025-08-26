package com.example.demo.service.impl;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderResponseDTO;
import com.example.demo.mapper.OrderMapper;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.PaymentInfo;
import com.example.demo.repository.OrderRepository;
import com.example.demo.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    public OrderServiceImpl(OrderRepository orderRepository, OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
    }

    // Helper method to determine valid next statuses
    private List<String> getNextAvailableStatuses(String currentStatus, boolean isPaid) {
        if (!isPaid && !currentStatus.equalsIgnoreCase("cancelled")) {
            return List.of(); // Unpaid orders cannot progress beyond pending or cancelled
        }

        switch (currentStatus.toLowerCase()) {
            case "pending":
                return isPaid ? List.of("confirmed") : List.of();
            case "confirmed":
                return List.of("processing");
            case "processing":
                return List.of("shipped");
            case "shipped":
                return List.of("delivered");
            case "delivered":
            case "cancelled":
                return List.of(); // Final states
            default:
                return List.of();
        }
    }

    @Override
    @Transactional
    public OrderResponseDTO placeOrder(@Valid OrderDTO orderDTO) {
        validateOrderDTO(orderDTO);
        Order order = orderMapper.toEntity(orderDTO);
        order.setOrderId(generateOrderId());
        order.setStatus("pending");
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // Ensure PaymentInfo is initialized
        if (order.getPaymentInfo() == null) {
            logger.warn("PaymentInfo is null for order, initializing with default values");
            order.setPaymentInfo(new PaymentInfo(null, false));
            order.getPaymentInfo().setMethod("Stripe");
        }

        // Set the Order reference in each OrderItem to populate order_id
        for (OrderItem item : order.getItems()) {
            item.setOrder(order);
        }

        Order savedOrder = orderRepository.save(order);
        logger.info("Order created with ID: {}, paid: {}", savedOrder.getOrderId(), savedOrder.getPaymentInfo().isPaid());
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponseDTO cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        if (!order.getStatus().equalsIgnoreCase("pending")) {
            throw new IllegalArgumentException("Only pending orders can be cancelled");
        }
        order.setStatus("cancelled");
        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        logger.info("Order cancelled with ID: {}, status: {}", orderId, savedOrder.getStatus());
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponseDTO editOrder(String orderId, @Valid OrderDTO orderDTO) {
        validateOrderDTO(orderDTO);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        if (!order.getStatus().equalsIgnoreCase("pending")) {
            throw new IllegalArgumentException("Only pending orders can be edited");
        }
        // Clear existing items to avoid duplicates
        order.getItems().clear();
        // Map new items and set Order reference
        Order newOrder = orderMapper.toEntity(orderDTO);
        for (OrderItem item : newOrder.getItems()) {
            item.setOrder(order);
            order.getItems().add(item);
        }
        order.setShippingAddress(newOrder.getShippingAddress());
        order.setTotalAmount(orderDTO.getTotalAmount());
        order.setCurrency(orderDTO.getCurrency());
        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        logger.info("Order edited with ID: {}, totalAmount: {}", orderId, savedOrder.getTotalAmount());
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatus(String orderId, String status) {
        // Validate status
        if (!List.of("pending", "cancelled", "confirmed", "processing", "shipped", "delivered", "failed", "requires_action").contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        // Ensure PaymentInfo is initialized
        if (order.getPaymentInfo() == null) {
            logger.warn("PaymentInfo is null for orderId: {}, initializing", orderId);
            order.setPaymentInfo(new PaymentInfo(null, false));
            order.getPaymentInfo().setMethod("Stripe");
        }

        // Validate status transition
        boolean isPaid = order.getPaymentInfo().isPaid();
        List<String> allowedStatuses = getNextAvailableStatuses(order.getStatus(), isPaid);
        if (!allowedStatuses.contains(status)) {
            throw new IllegalArgumentException(
                    String.format("Cannot change status from %s to %s. %s",
                            order.getStatus(),
                            status,
                            !isPaid && !status.equals("cancelled") ? "Order must be paid first." : "Invalid status transition.")
            );
        }

        // Update status
        order.setStatus(status);
        if (status.equals("confirmed")) {
            logger.info("Setting paymentInfo.paid to true for orderId: {}", orderId);
            order.getPaymentInfo().setPaid(true);
        }
        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        logger.info("Order updated with ID: {}, status: {}, paid: {}",
                orderId, savedOrder.getStatus(), savedOrder.getPaymentInfo().isPaid());
        return orderMapper.toDTO(savedOrder);
    }

    @Override
    public List<OrderResponseDTO> getOrdersByUserEmail(String userEmail) {
        List<OrderResponseDTO> orders = orderRepository.findAll().stream()
                .filter(o -> o.getUserEmail().equalsIgnoreCase(userEmail))
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
        logger.info("Fetched {} orders for userEmail: {}", orders.size(), userEmail);
        return orders;
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        List<OrderResponseDTO> orders = orderRepository.findAll().stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
        logger.info("Fetched {} orders", orders.size());
        return orders;
    }

    private void validateOrderDTO(OrderDTO orderDTO) {
        if (!List.of("PKR", "USD").contains(orderDTO.getCurrency())) {
            throw new IllegalArgumentException("Invalid currency: " + orderDTO.getCurrency());
        }
    }

    private String generateOrderId() {
        return UUID.randomUUID().toString();
    }
}