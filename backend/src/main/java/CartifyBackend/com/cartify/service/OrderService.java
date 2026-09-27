package com.cartify.service;

import com.cartify.model.Order;
import com.cartify.repository.OrderRepository;
import org.springframework.stereotype.Service;
import com.cartify.model.CartItem;
import com.cartify.model.Product;
import com.cartify.repository.CartItemRepository;
import com.cartify.repository.ProductRepository;

import java.util.List;

@Service
public class OrderService {

   private final OrderRepository orderRepository;
private final CartItemRepository cartItemRepository;
private final ProductRepository productRepository;

public OrderService(
        OrderRepository orderRepository,
        CartItemRepository cartItemRepository,
        ProductRepository productRepository) {

    this.orderRepository = orderRepository;
    this.cartItemRepository = cartItemRepository;
    this.productRepository = productRepository;
}

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }
    public Order createOrderFromCart(Long customerId) {

    List<CartItem> cartItems = cartItemRepository.findAll();

    if (cartItems.isEmpty()) {
        return null;
    }

    double total = 0;

    for (CartItem item : cartItems) {

        Product product = productRepository
                .findById(item.getProductId())
                .orElse(null);

        if (product == null) {
            return null;
        }

        if (item.getQuantity() > product.getStock()) {
            return null;
        }

        total += product.getPrice() * item.getQuantity();

        product.setStock(product.getStock() - item.getQuantity());
        productRepository.save(product);
    }

    Order order = new Order(customerId, total, "PLACED");

    Order savedOrder = orderRepository.save(order);

    cartItemRepository.deleteAll();

    return savedOrder;
    }
}