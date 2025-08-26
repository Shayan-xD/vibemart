package com.example.demo.service;

import com.example.demo.dto.SellerDTO;
import com.example.demo.dto.SellerResponseDTO;

import java.util.List;

public interface SellerService {
    SellerResponseDTO addSeller(SellerDTO sellerDTO);
    void deleteSeller(Long id);
    SellerResponseDTO updateSeller(Long id, SellerDTO sellerDTO);
    List<SellerResponseDTO> getAllSellers();
    SellerResponseDTO getSellerById(Long id);
}
