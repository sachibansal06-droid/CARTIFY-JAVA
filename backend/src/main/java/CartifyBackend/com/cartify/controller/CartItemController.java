package com.cartify.controller;

import com.cartify.model.CartItem;
import com.cartify.service.CartItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
public class CartItemController {

    private final CartItemService cartItemService;

    public CartItemController(CartItemService cartItemService) {
        this.cartItemService = cartItemService;
    }

    @GetMapping
    public List<CartItem> getCartItems() {
        return cartItemService.getAllCartItems();
    }
    
    @GetMapping("/total")
public double getCartTotal() {
    return cartItemService.getCartTotal();
    }

    @PostMapping
    public CartItem addToCart(@RequestBody CartItem cartItem) {
        return cartItemService.addToCart(cartItem);
    }

    @DeleteMapping("/{id}")
    public void removeFromCart(@PathVariable Long id) {
        cartItemService.removeFromCart(id);
    }
    @PutMapping("/{id}")
public CartItem updateQuantity(
        @PathVariable Long id,
        @RequestBody CartItem updatedItem) {

    return cartItemService.updateQuantity(
            id,
            updatedItem.getQuantity()
    );
}
}