package com.library.dto;

import lombok.Data;

@Data
public class IssueRequest {
    private Long bookId;
    private Long memberId;
    private Integer loanDays;
}
