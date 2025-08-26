package com.example.demo.mapper;

import com.example.demo.dto.ReviewDTO;
import com.example.demo.dto.ReviewResponseDTO;
import com.example.demo.model.Review;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    Review toEntity(ReviewDTO dto);
    ReviewResponseDTO toDTO(Review review);
}
