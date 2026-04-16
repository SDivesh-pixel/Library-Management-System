package com.library.dto;

import lombok.Data;

@Data
public class BookRequest {
    private String title;
    private String author;
    private String isbn;
    private String genre;
    private Integer publishedYear;
    private Integer totalCopies;
}
