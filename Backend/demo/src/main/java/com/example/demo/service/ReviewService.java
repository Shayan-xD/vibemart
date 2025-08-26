package com.example.demo.service;

import com.example.demo.dto.ReviewDTO;
import com.example.demo.dto.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {
    ReviewResponseDTO addReview(ReviewDTO reviewDTO);
    ReviewResponseDTO updateReview(Long id, String userEmail, ReviewDTO reviewDTO);
    void deleteReview(Long id, String userEmail);
    ReviewResponseDTO likeReview(Long id, String userEmail);
    ReviewResponseDTO markHelpful(Long id, String userEmail);
    List<ReviewResponseDTO> getReviewsByProductId(Long productId);
    public List<ReviewResponseDTO> getAllReviews();
}
