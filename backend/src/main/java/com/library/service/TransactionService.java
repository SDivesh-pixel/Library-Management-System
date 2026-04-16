package com.library.service;

import com.library.dto.IssueRequest;
import com.library.dto.TransactionResponse;
import com.library.entity.Book;
import com.library.entity.Member;
import com.library.entity.Transaction;
import com.library.repository.BookRepository;
import com.library.repository.MemberRepository;
import com.library.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public List<TransactionResponse> findAll(String status) {
        List<Transaction> list;
        if (status != null && !status.isBlank()) {
            try {
                Transaction.Status s = Transaction.Status.valueOf(status.toUpperCase());
                list = transactionRepository.findByStatusWithDetails(s);
            } catch (IllegalArgumentException e) {
                list = transactionRepository.findAllWithDetails();
            }
        } else {
            list = transactionRepository.findAllWithDetails();
        }
        return list.stream().map(TransactionResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse issue(IssueRequest req) {
        Book book = bookRepository.findById(req.getBookId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        Member member = memberRepository.findById(req.getMemberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        if (!member.getIsActive())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Member is not active");
        if (book.getAvailableCopies() < 1)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No copies available");

        int days = req.getLoanDays() != null ? req.getLoanDays() : 14;
        Transaction txn = Transaction.builder()
                .book(book)
                .member(member)
                .dueDate(LocalDateTime.now().plusDays(days))
                .fine(0.0)
                .status(Transaction.Status.ISSUED)
                .build();

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        return TransactionResponse.from(transactionRepository.save(txn));
    }

    @Transactional
    public TransactionResponse returnBook(Long id) {
        Transaction txn = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        if (txn.getStatus() == Transaction.Status.RETURNED)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Book already returned");

        LocalDateTime now = LocalDateTime.now();
        double fine = 0.0;
        if (now.isAfter(txn.getDueDate())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(txn.getDueDate(), now) + 1;
            fine = overdueDays * 1.0; // $1 per day
        }

        txn.setReturnedAt(now);
        txn.setFine(fine);
        txn.setStatus(Transaction.Status.RETURNED);

        Book book = txn.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return TransactionResponse.from(transactionRepository.save(txn));
    }
}
