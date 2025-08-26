package com.example.demo.controller;

import com.example.demo.dto.ReviewDTO;
import com.example.demo.dto.ReviewResponseDTO;
import com.example.demo.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> addReview(@RequestBody ReviewDTO reviewDTO) {
        ReviewResponseDTO createdReview = reviewService.addReview(reviewDTO);
        return new ResponseEntity<>(createdReview, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponseDTO> updateReview(@PathVariable Long id,
                                                          @RequestParam String userEmail,
                                                          @RequestBody ReviewDTO reviewDTO) {
        ReviewResponseDTO updatedReview = reviewService.updateReview(id, userEmail, reviewDTO);
        return ResponseEntity.ok(updatedReview);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id, @RequestParam String userEmail) {
        reviewService.deleteReview(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ReviewResponseDTO> likeReview(@PathVariable Long id, @RequestParam String userEmail) {
        ReviewResponseDTO likedReview = reviewService.likeReview(id, userEmail);
        return ResponseEntity.ok(likedReview);
    }

    @PostMapping("/{id}/helpful")
    public ResponseEntity<ReviewResponseDTO> markHelpful(@PathVariable Long id, @RequestParam String userEmail) {
        ReviewResponseDTO helpfulReview = reviewService.markHelpful(id, userEmail);
        return ResponseEntity.ok(helpfulReview);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByProductId(@PathVariable Long productId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponseDTO>> getAllReviews() {
        List<ReviewResponseDTO> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }
}
