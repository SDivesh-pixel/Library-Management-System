package com.library.dto;

import com.library.entity.Transaction;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private Long memberId;
    private String memberName;
    private LocalDateTime issuedAt;
    private LocalDateTime dueDate;
    private LocalDateTime returnedAt;
    private Double fine;
    private String status;

    public static TransactionResponse from(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .bookId(t.getBook().getId())
                .bookTitle(t.getBook().getTitle())
                .bookAuthor(t.getBook().getAuthor())
                .memberId(t.getMember().getId())
                .memberName(t.getMember().getName())
                .issuedAt(t.getIssuedAt())
                .dueDate(t.getDueDate())
                .returnedAt(t.getReturnedAt())
                .fine(t.getFine())
                .status(t.getStatus().name())
                .build();
    }
}
