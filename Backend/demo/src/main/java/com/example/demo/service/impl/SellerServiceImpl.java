package com.example.demo.service.impl;

import com.example.demo.dto.SellerDTO;
import com.example.demo.dto.SellerResponseDTO;
import com.example.demo.mapper.SellerMapper;
import com.example.demo.model.Seller;
import com.example.demo.repository.SellerRepository;
import com.example.demo.service.SellerService;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SellerServiceImpl implements SellerService {

    private final SellerRepository sellerRepository;
    private final SellerMapper sellerMapper;

    public SellerServiceImpl(SellerRepository sellerRepository, SellerMapper sellerMapper) {
        this.sellerRepository = sellerRepository;
        this.sellerMapper = sellerMapper;
    }

    @Override
    @Transactional
    public SellerResponseDTO addSeller(SellerDTO sellerDTO) {
        if (sellerRepository.existsByEmail(sellerDTO.getEmail())) {
            throw new RuntimeException("Seller email already exists");
        }
        if (sellerDTO.getStatus() == null) {
            sellerDTO.setStatus("active");
        }
        Seller seller = sellerMapper.toEntity(sellerDTO);
        return sellerMapper.toDTO(sellerRepository.save(seller));
    }

    @Override
    @Transactional
    public void deleteSeller(Long id) {
        if (!sellerRepository.existsById(id)) {
            throw new RuntimeException("Seller not found");
        }
        sellerRepository.deleteById(id);
    }

    @Override
    @Transactional
    public SellerResponseDTO updateSeller(Long id, SellerDTO sellerDTO) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        if (!seller.getEmail().equals(sellerDTO.getEmail()) && sellerRepository.existsByEmail(sellerDTO.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        seller.setCompany(sellerDTO.getCompany());
        seller.setEmail(sellerDTO.getEmail());
        seller.setStatus(sellerDTO.getStatus());

        return sellerMapper.toDTO(sellerRepository.save(seller));
    }

    @Override
    public List<SellerResponseDTO> getAllSellers() {
        return sellerRepository.findAll().stream()
                .map(sellerMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SellerResponseDTO getSellerById(Long id) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return sellerMapper.toDTO(seller);
    }
}
