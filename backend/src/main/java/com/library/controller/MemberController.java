package com.library.controller;

import com.library.dto.MemberRequest;
import com.library.entity.Member;
import com.library.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public List<Member> getAll(@RequestParam(required = false) String search) {
        return memberService.findAll(search);
    }

    @GetMapping("/{id}")
    public Member getById(@PathVariable Long id) {
        return memberService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Member> create(@RequestBody MemberRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.create(req));
    }

    @PutMapping("/{id}")
    public Member update(@PathVariable Long id, @RequestBody MemberRequest req) {
        return memberService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        memberService.deactivate(id);
        return ResponseEntity.ok(Map.of("message", "Member deactivated"));
    }
}
