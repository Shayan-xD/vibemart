package com.example.demo.service.impl;

import com.example.demo.dto.ReviewDTO;
import com.example.demo.dto.ReviewResponseDTO;
import com.example.demo.mapper.ReviewMapper;
import com.example.demo.model.Review;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.service.ReviewService;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    public ReviewServiceImpl(ReviewRepository reviewRepository, ReviewMapper reviewMapper) {
        this.reviewRepository = reviewRepository;
        this.reviewMapper = reviewMapper;
    }

    @Override
    @Transactional
    public ReviewResponseDTO addReview(ReviewDTO reviewDTO) {
        Optional<Review> existing = reviewRepository.findByUserEmailAndProductId(reviewDTO.getUserEmail(), reviewDTO.getProductId());
        if (existing.isPresent()) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Review review = reviewMapper.toEntity(reviewDTO);
        review.setDate(LocalDate.now());
        review = reviewRepository.save(review);
        return reviewMapper.toDTO(review);
    }

    @Override
    @Transactional
    public ReviewResponseDTO updateReview(Long id, String userEmail, ReviewDTO reviewDTO) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        review.setTitle(reviewDTO.getTitle());
        review.setContent(reviewDTO.getContent());
        review.setRating(reviewDTO.getRating());
        review.setDate(LocalDate.now());

        return reviewMapper.toDTO(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteReview(Long id, String userEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        reviewRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ReviewResponseDTO likeReview(Long id, String userEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (review.getLikedBy().contains(userEmail)) {
            review.setLikes(Math.max(0, review.getLikes() - 1));
            review.getLikedBy().remove(userEmail);
        } else {
            review.setLikes(review.getLikes() + 1);
            review.getLikedBy().add(userEmail);
        }
        return reviewMapper.toDTO(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public ReviewResponseDTO markHelpful(Long id, String userEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (review.getMarkedHelpfulBy().contains(userEmail)) {
            review.setHelpful(Math.max(0, review.getHelpful() - 1));
            review.getMarkedHelpfulBy().remove(userEmail);
        } else {
            review.setHelpful(review.getHelpful() + 1);
            review.getMarkedHelpfulBy().add(userEmail);
        }
        return reviewMapper.toDTO(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByProductId(Long productId) {
        return reviewRepository.findAll().stream()
                .filter(r -> r.getProductId().equals(productId))
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }
}
