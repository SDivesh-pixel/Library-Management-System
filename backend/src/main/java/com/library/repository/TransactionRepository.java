package com.library.repository;

import com.library.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByStatus(Transaction.Status status);

    List<Transaction> findByMemberId(Long memberId);

    boolean existsByBookIdAndStatus(Long bookId, Transaction.Status status);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'ISSUED'")
    long countIssued();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'ISSUED' AND t.dueDate < :now")
    long countOverdue(@Param("now") LocalDateTime now);

    @Query("SELECT COALESCE(SUM(t.fine), 0) FROM Transaction t")
    Double totalFines();

    @Query("SELECT t FROM Transaction t JOIN FETCH t.book JOIN FETCH t.member ORDER BY t.issuedAt DESC")
    List<Transaction> findAllWithDetails();

    @Query("SELECT t FROM Transaction t JOIN FETCH t.book JOIN FETCH t.member WHERE t.status = :status ORDER BY t.issuedAt DESC")
    List<Transaction> findByStatusWithDetails(@Param("status") Transaction.Status status);

    @Query("SELECT t FROM Transaction t JOIN FETCH t.book JOIN FETCH t.member ORDER BY t.issuedAt DESC LIMIT 5")
    List<Transaction> findRecent();
}
