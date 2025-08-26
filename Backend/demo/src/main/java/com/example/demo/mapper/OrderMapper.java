package com.example.demo.mapper;

import com.example.demo.dto.*;
import com.example.demo.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    @Mapping(target = "paymentInfo", expression = "java(new PaymentInfo(null, false))")
    Order toEntity(OrderDTO dto);

    OrderResponseDTO toDTO(Order entity);

    OrderItem toEntity(OrderItemDTO dto);
    OrderItemDTO toDTO(OrderItem entity);

    ShippingAddress toEntity(ShippingAddressDTO dto);
    ShippingAddressDTO toDTO(ShippingAddress entity);

    PaymentInfo toEntity(PaymentInfoDTO dto);
    PaymentInfoDTO toDTO(PaymentInfo entity);
}