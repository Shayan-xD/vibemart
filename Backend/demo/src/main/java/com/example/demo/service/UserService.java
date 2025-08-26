package com.example.demo.service;

import com.example.demo.dto.UserDTO;
import com.example.demo.dto.UserResponseDTO;
import com.example.demo.model.ShippingAddress;
import java.util.List;

public interface UserService {
    UserResponseDTO createUser(UserDTO userDTO);
    UserResponseDTO updateUser(Long id, UserDTO userDTO);
    UserResponseDTO updateNameAndAddress(Long id, String name, ShippingAddress shippingAddress);
    void deleteUser(Long id);
    UserResponseDTO getUserById(Long id);
    List<UserResponseDTO> getAllUsers();
    UserResponseDTO login(String email, String password);
}