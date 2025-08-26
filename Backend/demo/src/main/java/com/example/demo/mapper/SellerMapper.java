package com.example.demo.mapper;

import com.example.demo.dto.SellerDTO;
import com.example.demo.dto.SellerResponseDTO;
import com.example.demo.model.Seller;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface SellerMapper {

    SellerMapper INSTANCE = Mappers.getMapper(SellerMapper.class);

    Seller toEntity(SellerDTO dto);

    SellerResponseDTO toDTO(Seller seller);
}
