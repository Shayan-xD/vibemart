package com.example.demo.controller;

import com.example.demo.dto.SellerDTO;
import com.example.demo.dto.SellerResponseDTO;
import com.example.demo.service.SellerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @PostMapping
    public ResponseEntity<SellerResponseDTO> addSeller(@RequestBody SellerDTO sellerDTO) {
        SellerResponseDTO createdSeller = sellerService.addSeller(sellerDTO);
        return new ResponseEntity<>(createdSeller, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SellerResponseDTO>> getAllSellers() {
        List<SellerResponseDTO> sellers = sellerService.getAllSellers();
        return ResponseEntity.ok(sellers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SellerResponseDTO> getSellerById(@PathVariable Long id) {
        SellerResponseDTO seller = sellerService.getSellerById(id);
        return ResponseEntity.ok(seller);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SellerResponseDTO> updateSeller(@PathVariable Long id, @RequestBody SellerDTO sellerDTO) {
        SellerResponseDTO updatedSeller = sellerService.updateSeller(id, sellerDTO);
        return ResponseEntity.ok(updatedSeller);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeller(@PathVariable Long id) {
        sellerService.deleteSeller(id);
        return ResponseEntity.noContent().build();
    }
}
