package com.cartify.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cartify.model.CartItem;
import com.cartify.model.Product;
import com.cartify.repository.CartItemRepository;
import com.cartify.repository.ProductRepository;

@Service
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    
    public CartItemService(
        CartItemRepository cartItemRepository,
        ProductRepository productRepository) {

    this.cartItemRepository = cartItemRepository;
    this.productRepository = productRepository;
}
    

    public List<CartItem> getAllCartItems() {
        return cartItemRepository.findAll();
    }
    public double getCartTotal() {

    double total = 0;

    List<CartItem> cartItems = cartItemRepository.findAll();

    for (CartItem item : cartItems) {

        Product product = productRepository.findById(item.getProductId())
                .orElse(null);

        if (product != null) {
            total += item.getTotalPrice(product.getPrice());
        }
    }

    return total;
}

    public CartItem addToCart(CartItem cartItem) {

    Product product = productRepository.findById(cartItem.getProductId())
            .orElse(null);

    if (product == null) {
        return null;
    }

    if (cartItem.getQuantity() <= 0) {
        cartItem.setQuantity(1);
    }

    if (cartItem.getQuantity() > product.getStock()) {
        return null;
    }

    return cartItemRepository.save(cartItem);
}

    public void removeFromCart(Long id) {
        cartItemRepository.deleteById(id);
    }
    public CartItem updateQuantity(Long id, int quantity) {

    CartItem item = cartItemRepository.findById(id).orElse(null);

    if (item == null) {
        return null;
    }

    Product product = productRepository
            .findById(item.getProductId())
            .orElse(null);

    if (product == null) {
        return null;
    }

    if (quantity < 1) {
        return null;
    }

    if (quantity > product.getStock()) {
        return null;
    }

    item.setQuantity(quantity);

    return cartItemRepository.save(item);
    }
}