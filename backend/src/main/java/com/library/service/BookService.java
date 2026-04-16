package com.library.service;

import com.library.dto.BookRequest;
import com.library.entity.Book;
import com.library.entity.Transaction;
import com.library.repository.BookRepository;
import com.library.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final TransactionRepository transactionRepository;

    public List<Book> findAll(String search) {
        if (search != null && !search.isBlank()) return bookRepository.search(search.trim());
        return bookRepository.findAll();
    }

    public Book findById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
    }

    public Book create(BookRequest req) {
        if (bookRepository.existsByIsbn(req.getIsbn()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "ISBN already exists");

        int copies = req.getTotalCopies() != null ? req.getTotalCopies() : 1;
        Book book = Book.builder()
                .title(req.getTitle())
                .author(req.getAuthor())
                .isbn(req.getIsbn())
                .genre(req.getGenre())
                .publishedYear(req.getPublishedYear())
                .totalCopies(copies)
                .availableCopies(copies)
                .build();
        return bookRepository.save(book);
    }

    public Book update(Long id, BookRequest req) {
        Book book = findById(id);
        int diff = req.getTotalCopies() != null ? req.getTotalCopies() - book.getTotalCopies() : 0;
        book.setTitle(req.getTitle() != null ? req.getTitle() : book.getTitle());
        book.setAuthor(req.getAuthor() != null ? req.getAuthor() : book.getAuthor());
        book.setIsbn(req.getIsbn() != null ? req.getIsbn() : book.getIsbn());
        book.setGenre(req.getGenre() != null ? req.getGenre() : book.getGenre());
        book.setPublishedYear(req.getPublishedYear() != null ? req.getPublishedYear() : book.getPublishedYear());
        if (req.getTotalCopies() != null) {
            book.setTotalCopies(req.getTotalCopies());
            book.setAvailableCopies(Math.max(0, book.getAvailableCopies() + diff));
        }
        return bookRepository.save(book);
    }

    public void delete(Long id) {
        Book book = findById(id);
        boolean hasActive = transactionRepository.existsByBookIdAndStatus(id, Transaction.Status.ISSUED);
        if (hasActive)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete: book has active issues");
        bookRepository.delete(book);
    }
}
