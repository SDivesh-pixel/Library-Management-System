package com.library.controller;

import com.library.repository.BookRepository;
import com.library.repository.MemberRepository;
import com.library.repository.TransactionRepository;
import com.library.dto.TransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping
    public Map<String, Object> dashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBooks",     bookRepository.count());
        stats.put("totalMembers",   memberRepository.count());
        stats.put("issuedBooks",    transactionRepository.countIssued());
        stats.put("overdueBooks",   transactionRepository.countOverdue(LocalDateTime.now()));
        stats.put("totalFines",     transactionRepository.totalFines());
        stats.put("availableBooks", bookRepository.findAll().stream()
                .mapToLong(b -> b.getAvailableCopies()).sum());

        List<TransactionResponse> recent = transactionRepository.findRecent()
                .stream().map(TransactionResponse::from).collect(Collectors.toList());

        // Genre stats
        Map<String, Long> genreMap = bookRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        b -> b.getGenre() != null ? b.getGenre() : "Unknown",
                        Collectors.counting()));
        List<Map<String, Object>> genreStats = genreMap.entrySet().stream()
                .map(e -> { Map<String, Object> m = new HashMap<>(); m.put("genre", e.getKey()); m.put("count", e.getValue()); return m; })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("stats", stats);
        result.put("recentTransactions", recent);
        result.put("genreStats", genreStats);
        return result;
    }
}
