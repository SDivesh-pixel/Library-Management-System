package com.library.controller;

import com.library.dto.IssueRequest;
import com.library.dto.TransactionResponse;
import com.library.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public List<TransactionResponse> getAll(@RequestParam(required = false) String status) {
        return transactionService.findAll(status);
    }

    @PostMapping("/issue")
    public ResponseEntity<TransactionResponse> issue(@RequestBody IssueRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.issue(req));
    }

    @PostMapping("/{id}/return")
    public TransactionResponse returnBook(@PathVariable Long id) {
        return transactionService.returnBook(id);
    }
}
