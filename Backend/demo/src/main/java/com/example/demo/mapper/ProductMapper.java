package com.example.demo.mapper;

import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductResponseDTO;
import com.example.demo.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(source = "sellerEmail", target = "sellerEmail")
    Product toEntity(ProductDTO dto);

    @Mapping(source = "sellerEmail", target = "sellerEmail")
    ProductResponseDTO toDTO(Product product);
}