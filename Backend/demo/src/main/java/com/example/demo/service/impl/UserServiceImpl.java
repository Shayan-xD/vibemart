//package com.example.demo.service.impl;
//
//import com.example.demo.dto.UserDTO;
//import com.example.demo.dto.UserResponseDTO;
//import com.example.demo.mapper.UserMapper;
//import com.example.demo.model.ShippingAddress;
//import com.example.demo.model.User;
//import com.example.demo.repository.UserRepository;
//import com.example.demo.service.UserService;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//public class UserServiceImpl implements UserService {
//
//    private final UserRepository userRepository;
//    private final UserMapper userMapper;
//    private final BCryptPasswordEncoder passwordEncoder;
//
//    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, BCryptPasswordEncoder passwordEncoder) {
//        this.userRepository = userRepository;
//        this.userMapper = userMapper;
//        this.passwordEncoder = passwordEncoder;
//    }
//
//    @Override
//    @Transactional
//    public UserResponseDTO createUser(UserDTO userDTO) {
//        if (userRepository.existsByEmail(userDTO.getEmail())) {
//            throw new RuntimeException("Email already exists");
//        }
//
//        userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));
//        User user = userMapper.toEntity(userDTO);
//        return userMapper.toDTO(userRepository.save(user));
//    }
//
//    @Override
//    @Transactional
//    public UserResponseDTO updateUser(Long id, UserDTO userDTO) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if (userDTO.getName() != null) user.setName(userDTO.getName());
//        if (userDTO.getEmail() != null) user.setEmail(userDTO.getEmail());
//        if (userDTO.getPassword() != null) user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
//        if (userDTO.getImage() != null) user.setImage(userDTO.getImage());
//        if (userDTO.getShippingAddress() != null) user.setShippingAddress(userDTO.getShippingAddress());
//
//        return userMapper.toDTO(userRepository.save(user));
//    }
//
//    @Override
//    @Transactional
//    public UserResponseDTO updateNameAndAddress(Long id, String name, ShippingAddress shippingAddress) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if (name != null) {
//            user.setName(name);
//        }
//        if (shippingAddress != null) {
//            user.setShippingAddress(shippingAddress);
//        }
//
//        return userMapper.toDTO(userRepository.save(user));
//    }
//
//    @Override
//    @Transactional
//    public void deleteUser(Long id) {
//        userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        userRepository.deleteById(id);
//    }
//
//    @Override
//    public UserResponseDTO getUserById(Long id) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        return userMapper.toDTO(user);
//    }
//
//    @Override
//    public List<UserResponseDTO> getAllUsers() {
//        return userRepository.findAll().stream()
//                .map(userMapper::toDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public UserResponseDTO login(String email, String password) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
//
//        if (!passwordEncoder.matches(password, user.getPassword())) {
//            throw new RuntimeException("Invalid email or password");
//        }
//        return userMapper.toDTO(user);
//    }
//}


package com.example.demo.service.impl;

import com.example.demo.dto.UserDTO;
import com.example.demo.dto.UserResponseDTO;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.ShippingAddress;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponseDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Removed password encoding to save plain password
        // userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        User user = userMapper.toEntity(userDTO);
        return userMapper.toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDTO.getName() != null) user.setName(userDTO.getName());
        if (userDTO.getEmail() != null) user.setEmail(userDTO.getEmail());
        if (userDTO.getPassword() != null) {
            // Removed encoding - set raw password
            user.setPassword(userDTO.getPassword());
        }
        if (userDTO.getImage() != null) user.setImage(userDTO.getImage());
        if (userDTO.getShippingAddress() != null) user.setShippingAddress(userDTO.getShippingAddress());

        return userMapper.toDTO(userRepository.save(user));
    }

//    @Override
//    @Transactional
//    public UserResponseDTO updateNameAndAddress(Long id, String name, ShippingAddress shippingAddress) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if (name != null) {
//            user.setName(name);
//        }
//        if (shippingAddress != null) {
//            user.setShippingAddress(shippingAddress);
//        }
//
//        return userMapper.toDTO(userRepository.save(user));
//    }

    @Override
    @Transactional
    public UserResponseDTO updateNameAndAddress(Long id, String name, ShippingAddress shippingAddress) {
        System.out.println("🔍 Looking for user with ID: " + id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ User not found"));

        // Only update if the value is not null
        if (name != null && !name.trim().isEmpty()) {
            System.out.println("✏️ Updating name to: " + name);
            user.setName(name);
        }

        if (shippingAddress != null) {
            System.out.println("🏠 Updating shipping address to: " + shippingAddress);
            user.setShippingAddress(shippingAddress);
        }

        User savedUser = userRepository.save(user);
        System.out.println("💾 User saved: " + savedUser);

        UserResponseDTO dto = userMapper.toDTO(savedUser);
        System.out.println("📤 Returning DTO: " + dto);

        return dto;
    }


    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.deleteById(id);
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toDTO(user);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO login(String email, String password) {
        System.out.println("🔍 Looking for user with email: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("❌ User not found with email: " + email);
                    return new RuntimeException("Invalid email or password");
                });

        System.out.println("👤 Found user: " + user.getName());
        System.out.println("🔐 Stored password: " + user.getPassword());
        System.out.println("🔐 Provided password: " + password);

        // Plain text password comparison
        if (!user.getPassword().equals(password)) {
            System.out.println("❌ Password mismatch!");
            throw new RuntimeException("Invalid email or password");
        }

        System.out.println("✅ Password matches!");
        return userMapper.toDTO(user);
    }
}
