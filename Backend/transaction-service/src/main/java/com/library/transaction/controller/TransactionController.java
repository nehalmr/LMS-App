package com.library.transaction.controller;

import com.library.transaction.exception.ResourceNotFoundException;

import com.library.transaction.dto.BorrowingTransactionDTO;
import com.library.transaction.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<BorrowingTransactionDTO>> getAllTransactions() {
        List<BorrowingTransactionDTO> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BorrowingTransactionDTO> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(transaction -> ResponseEntity.ok(transaction))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<BorrowingTransactionDTO>> getTransactionsByMemberId(@PathVariable Long memberId) {
        List<BorrowingTransactionDTO> transactions = transactionService.getTransactionsByMemberId(memberId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<BorrowingTransactionDTO>> getTransactionsByBookId(@PathVariable Long bookId) {
        List<BorrowingTransactionDTO> transactions = transactionService.getTransactionsByBookId(bookId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<BorrowingTransactionDTO>> getOverdueTransactions() {
        List<BorrowingTransactionDTO> transactions = transactionService.getOverdueTransactions();
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/borrow")
    public ResponseEntity<BorrowingTransactionDTO> borrowBook(@Valid @RequestBody BorrowingTransactionDTO transactionDTO) {
        BorrowingTransactionDTO borrowedTransaction = transactionService.borrowBook(transactionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(borrowedTransaction);
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<BorrowingTransactionDTO> returnBook(@PathVariable Long id) {
        return transactionService.returnBook(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
    }

    @PostMapping("/update-overdue")
    public ResponseEntity<Map<String, String>> updateOverdueTransactions() {
        transactionService.updateOverdueTransactions();
        return ResponseEntity.ok(Map.of("message", "Overdue transactions updated successfully"));
    }
}
