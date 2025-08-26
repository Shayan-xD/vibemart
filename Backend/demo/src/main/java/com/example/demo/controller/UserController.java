package com.example.demo.controller;

import com.example.demo.dto.UpdateUserRequest;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.UserResponseDTO;
import com.example.demo.model.ShippingAddress;
import com.example.demo.service.CloudinaryService;
import com.example.demo.service.UserService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
//@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class UserController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public UserController(UserService userService, CloudinaryService cloudinaryService) {
        this.userService = userService;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserDTO userDTO) {
        UserResponseDTO createdUser = userService.createUser(userDTO);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = cloudinaryService.uploadFile(file);
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload image: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        UserResponseDTO updatedUser = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

//    @PatchMapping("/{id}/name-address")
//    public ResponseEntity<UserResponseDTO> updateNameAndAddress(@PathVariable Long id,
//                                                                @RequestParam(required = false) String name,
//                                                                @RequestBody(required = false) ShippingAddress shippingAddress) {
//        UserResponseDTO updatedUser = userService.updateNameAndAddress(id, name, shippingAddress);
//        return ResponseEntity.ok(updatedUser);
//    }

    @PatchMapping("/{id}/name-address")
    public ResponseEntity<UserResponseDTO> updateNameAndAddress(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest updateRequest) { // Use the new DTO

        System.out.println("🎯 PATCH /api/users/" + id + "/name-address called");
        System.out.println("📥 Request Body: " + updateRequest);

        UserResponseDTO updatedUser = userService.updateNameAndAddress(
                id,
                updateRequest.getName(),
                updateRequest.getShippingAddress()
        );

        System.out.println("✅ User updated successfully: " + updatedUser.getName());
        return ResponseEntity.ok(updatedUser);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        System.out.println("🚀 Login request received: " + loginRequest);

        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        System.out.println("📧 Email: " + email);
        System.out.println("🔐 Password: " + password);

        try {
            UserResponseDTO user = userService.login(email, password);
            System.out.println("✅ User found: " + user.getName());

            String token = Jwts.builder()
                    .setSubject(user.getEmail())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                    .signWith(SignatureAlgorithm.HS512, jwtSecret)
                    .compact();

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);

            System.out.println("📤 Sending response: " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Login failed: " + e.getMessage());
            throw e;  // Re-throw to let Spring handle the error response
        }
    }
}