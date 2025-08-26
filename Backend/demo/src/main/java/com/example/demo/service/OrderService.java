package com.example.demo.service;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderResponseDTO;
import java.util.List;

public interface OrderService {
    OrderResponseDTO placeOrder(OrderDTO orderDTO);
    OrderResponseDTO cancelOrder(String orderId);
    OrderResponseDTO editOrder(String orderId, OrderDTO orderDTO);
    OrderResponseDTO updateOrderStatus(String orderId, String status);
    List<OrderResponseDTO> getOrdersByUserEmail(String userEmail);
    List<OrderResponseDTO> getAllOrders();
}