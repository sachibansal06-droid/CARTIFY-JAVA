package com.cartify.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cartify.model.Customer;
import com.cartify.repository.CustomerRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final CustomerRepository customerRepository;

    public AuthController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Customer customer) {

        Optional<Customer> existingCustomer =
                customerRepository.findByEmail(customer.getEmail());

        if (existingCustomer.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already registered"));
        }

        customer.setRole("CUSTOMER");

        Customer savedCustomer = customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "id", savedCustomer.getId(),
                "name", savedCustomer.getName(),
                "email", savedCustomer.getEmail(),
                "role", savedCustomer.getRole()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Customer loginRequest) {

        Optional<Customer> customer =
                customerRepository.findByEmail(loginRequest.getEmail());

        if (customer.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid email or password"));
        }

        Customer existingCustomer = customer.get();

        if (!existingCustomer.getPassword()
                .equals(loginRequest.getPassword())) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid email or password"));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "id", existingCustomer.getId(),
                "name", existingCustomer.getName(),
                "email", existingCustomer.getEmail(),
                "role", existingCustomer.getRole()
        ));
    }
}
