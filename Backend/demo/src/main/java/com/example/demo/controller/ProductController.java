package com.example.demo.controller;

import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductResponseDTO;
import com.example.demo.service.CloudinaryService;
import com.example.demo.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

@RestController
@RequestMapping("/api/products")
//@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowCredentials = "true")
public class ProductController {

    private final ProductService productService;
    private final CloudinaryService cloudinaryService;

    public ProductController(ProductService productService, CloudinaryService cloudinaryService) {
        this.productService = productService;
        this.cloudinaryService = cloudinaryService;
    }

    // Custom MultipartFile implementation for base64 data
    private static class ByteArrayMultipartFile implements MultipartFile {
        private final byte[] content;
        private final String name;
        private final String originalFilename;
        private final String contentType;

        public ByteArrayMultipartFile(byte[] content, String name, String originalFilename, String contentType) {
            this.content = content;
            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getOriginalFilename() {
            return originalFilename;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content == null || content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() throws IOException {
            return content;
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
            java.nio.file.Files.write(dest.toPath(), content);
        }
    }

    @GetMapping("/test")
    public String testProduct() {
        return "Product Controller is working!";
    }

    @PostMapping("/add")
    public ResponseEntity<ProductResponseDTO> addProduct(@RequestBody ProductDTO productDTO) {

        try {
            System.out.println("POST /api/products/add - Received ProductDTO: " + productDTO);
            System.out.println("Description: "+ productDTO.getDescription());
            System.out.println("Feature: "+ productDTO.getFeature());
            System.out.println("Seller Email : " + productDTO.getSellerEmail());

            // Process main image
            if (productDTO.getImage() != null && !productDTO.getImage().isEmpty()) {
                try {
                    String base64Data = productDTO.getImage().replaceAll("^data:image/[^;]+;base64,", "");
                    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                    String fileName = UUID.randomUUID() + "_main.jpg";
                    MultipartFile multipartFile = new ByteArrayMultipartFile(imageBytes, "file", fileName, "image/jpeg");
                    String imageUrl = cloudinaryService.uploadFile(multipartFile);
                    System.out.println("POST /api/products/add - Main image uploaded to Cloudinary: " + imageUrl);
                    productDTO.setImage(imageUrl);
                } catch (IOException e) {
                    System.err.println("POST /api/products/add - Error uploading main image to Cloudinary: " + e.getMessage());
                    throw new RuntimeException("Failed to upload main image: " + e.getMessage());
                } catch (IllegalArgumentException e) {
                    System.err.println("POST /api/products/add - Invalid base64 string for main image: " + e.getMessage());
                    // If it's not a base64 string, assume it's already a URL and keep it as is
                    System.out.println("POST /api/products/add - Keeping existing image URL: " + productDTO.getImage());
                }
            }

            // Process lifestyle images
            if (productDTO.getLifestyleImages() != null && !productDTO.getLifestyleImages().isEmpty()) {
                List<String> imageUrls = productDTO.getLifestyleImages().stream().map(base64 -> {
                    try {
                        // Check if it's already a URL (starts with http)
                        if (base64.startsWith("http")) {
                            System.out.println("POST /api/products/add - Lifestyle image is already a URL: " + base64);
                            return base64;
                        }

                        String base64Data = base64.replaceAll("^data:image/[^;]+;base64,", "");
                        byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                        String fileName = UUID.randomUUID() + "_lifestyle.jpg";
                        MultipartFile multipartFile = new ByteArrayMultipartFile(imageBytes, "file", fileName, "image/jpeg");
                        String imageUrl = cloudinaryService.uploadFile(multipartFile);
                        System.out.println("POST /api/products/add - Lifestyle image uploaded to Cloudinary: " + imageUrl);
                        return imageUrl;
                    } catch (IOException e) {
                        System.err.println("POST /api/products/add - Error uploading lifestyle image to Cloudinary: " + e.getMessage());
                        throw new RuntimeException("Failed to upload lifestyle image: " + e.getMessage());
                    } catch (IllegalArgumentException e) {
                        System.err.println("POST /api/products/add - Invalid base64 string for lifestyle image: " + e.getMessage());
                        // If it's not a base64 string, assume it's already a URL and return as is
                        System.out.println("POST /api/products/add - Keeping existing lifestyle image URL: " + base64);
                        return base64;
                    }
                }).toList();
                productDTO.setLifestyleImages(imageUrls);
            }

            ProductResponseDTO createdProduct = productService.addProduct(productDTO);
            System.out.println("POST /api/products/add - Created ProductResponseDTO: " + createdProduct);
            return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("POST /api/products/add - Error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        try {
            System.out.println("GET /api/products/all - Fetching all products");
            List<ProductResponseDTO> products = productService.getAllProducts();
            System.out.println("GET /api/products/all - Retrieved products: " + products.size());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.err.println("GET /api/products/all - Error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        try {
            System.out.println("GET /api/products/get/" + id + " - Fetching product");
            ProductResponseDTO product = productService.getProductById(id);
            if (product == null) {
                System.out.println("GET /api/products/get/" + id + " - Product not found");
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            System.out.println("GET /api/products/get/" + id + " - Retrieved product: " + product);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            System.err.println("GET /api/products/get/" + id + " - Error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        try {
            System.out.println("PUT /api/products/update/" + id + " - Updating product with DTO: " + productDTO);

            // Process main image if it's a new base64 string
            if (productDTO.getImage() != null && !productDTO.getImage().isEmpty() &&
                    productDTO.getImage().startsWith("data:image")) {
                try {
                    String base64Data = productDTO.getImage().replaceAll("^data:image/[^;]+;base64,", "");
                    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                    String fileName = UUID.randomUUID() + "_main.jpg";
                    MultipartFile multipartFile = new ByteArrayMultipartFile(imageBytes, "file", fileName, "image/jpeg");
                    String imageUrl = cloudinaryService.uploadFile(multipartFile);
                    System.out.println("PUT /api/products/update/" + id + " - Main image uploaded to Cloudinary: " + imageUrl);
                    productDTO.setImage(imageUrl);
                } catch (IOException e) {
                    System.err.println("PUT /api/products/update/" + id + " - Error uploading main image to Cloudinary: " + e.getMessage());
                    throw new RuntimeException("Failed to upload main image: " + e.getMessage());
                }
            }

            // Process lifestyle images
            if (productDTO.getLifestyleImages() != null && !productDTO.getLifestyleImages().isEmpty()) {
                List<String> imageUrls = productDTO.getLifestyleImages().stream().map(base64 -> {
                    // Check if it's already a URL (starts with http)
                    if (base64.startsWith("http")) {
                        System.out.println("PUT /api/products/update/" + id + " - Lifestyle image is already a URL: " + base64);
                        return base64;
                    }

                    // If it's a base64 string, upload it
                    if (base64.startsWith("data:image")) {
                        try {
                            String base64Data = base64.replaceAll("^data:image/[^;]+;base64,", "");
                            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                            String fileName = UUID.randomUUID() + "_lifestyle.jpg";
                            MultipartFile multipartFile = new ByteArrayMultipartFile(imageBytes, "file", fileName, "image/jpeg");
                            String imageUrl = cloudinaryService.uploadFile(multipartFile);
                            System.out.println("PUT /api/products/update/" + id + " - Lifestyle image uploaded to Cloudinary: " + imageUrl);
                            return imageUrl;
                        } catch (IOException e) {
                            System.err.println("PUT /api/products/update/" + id + " - Error uploading lifestyle image to Cloudinary: " + e.getMessage());
                            throw new RuntimeException("Failed to upload lifestyle image: " + e.getMessage());
                        }
                    }

                    // If it's neither URL nor base64, return as is (shouldn't happen)
                    return base64;
                }).toList();
                productDTO.setLifestyleImages(imageUrls);
            }

            ProductResponseDTO updatedProduct = productService.updateProduct(id, productDTO);
            if (updatedProduct == null) {
                System.out.println("PUT /api/products/update/" + id + " - Product not found");
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            System.out.println("PUT /api/products/update/" + id + " - Updated product: " + updatedProduct);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            System.err.println("PUT /api/products/update/" + id + " - Error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/reduce-stock/{id}")
    public ResponseEntity<Void> reduceProductQuantity(@PathVariable Long id, @RequestParam int quantity) {
        try {
            System.out.println("PATCH /api/products/reduce-stock/" + id + " - Reducing quantity by: " + quantity);
            productService.reduceProductQuantity(id, quantity);
            System.out.println("PATCH /api/products/reduce-stock/" + id + " - Quantity reduced");
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.err.println("PATCH /api/products/reduce-stock/" + id + " - Error: " + e.getMessage());
            if (e.getMessage().equals("Product not found")) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            System.err.println("PATCH /api/products/reduce-stock/" + id + " - Error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/increase-stock/{id}")
    public ResponseEntity<Void> increaseProductQuantity(@PathVariable Long id, @RequestParam int quantity) {
        try {
            System.out.println("PATCH /api/products/increase-stock/" + id + " - Increasing quantity by: " + quantity);
            productService.increaseProductQuantity(id, quantity);
            System.out.println("PATCH /api/products/increase-stock/" + id + " - Quantity increased");
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.err.println("PATCH /api/products/increase-stock/" + id + " - Error: " + e.getMessage());
            if (e.getMessage().equals("Product not found")) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            System.err.println("PATCH /api/products/increase-stock/" + id + " - Error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            System.out.println("DELETE /api/products/delete/" + id + " - Deleting product");
            productService.deleteProduct(id);
            System.out.println("DELETE /api/products/delete/" + id + " - Product deleted");
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.err.println("DELETE /api/products/delete/" + id + " - Error: " + e.getMessage());
            if (e.getMessage().equals("Product not found")) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            System.err.println("DELETE /api/products/delete/" + id + " - Error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}