package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    private Long productId;

    private String author;

    private String avatar;

    private int rating;

    private LocalDate date;

    private String title;

    @Column(length = 2000)
    private String content;

    private boolean verified;

    private String badge;

    private int likes;

    private int comments;

    private int helpful;

    @ElementCollection
    @CollectionTable(name = "review_liked_by", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "user_email")
    private List<String> likedBy = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "review_marked_helpful_by", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "user_email")
    private List<String> markedHelpfulBy = new ArrayList<>();

    public Review() {}

    public Review(Long id, String userEmail, Long productId, String author, String avatar, int rating, LocalDate date,
                  String title, String content, boolean verified, String badge, int likes, int comments, int helpful,
                  List<String> likedBy, List<String> markedHelpfulBy) {
        this.id = id;
        this.userEmail = userEmail;
        this.productId = productId;
        this.author = author;
        this.avatar = avatar;
        this.rating = rating;
        this.date = date;
        this.title = title;
        this.content = content;
        this.verified = verified;
        this.badge = badge;
        this.likes = likes;
        this.comments = comments;
        this.helpful = helpful;
        this.likedBy = likedBy;
        this.markedHelpfulBy = markedHelpfulBy;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public int getComments() {
        return comments;
    }

    public void setComments(int comments) {
        this.comments = comments;
    }

    public int getHelpful() {
        return helpful;
    }

    public void setHelpful(int helpful) {
        this.helpful = helpful;
    }

    public List<String> getLikedBy() {
        return likedBy;
    }

    public void setLikedBy(List<String> likedBy) {
        this.likedBy = likedBy;
    }

    public List<String> getMarkedHelpfulBy() {
        return markedHelpfulBy;
    }

    public void setMarkedHelpfulBy(List<String> markedHelpfulBy) {
        this.markedHelpfulBy = markedHelpfulBy;
    }
}
