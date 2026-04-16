package com.library.service;

import com.library.dto.MemberRequest;
import com.library.entity.Member;
import com.library.entity.Transaction;
import com.library.repository.MemberRepository;
import com.library.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final TransactionRepository transactionRepository;

    public List<Member> findAll(String search) {
        if (search != null && !search.isBlank()) return memberRepository.search(search.trim());
        return memberRepository.findAll();
    }

    public Member findById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
    }

    public Member create(MemberRequest req) {
        if (memberRepository.existsByEmail(req.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");

        Member.MembershipType type;
        try {
            type = Member.MembershipType.valueOf(req.getMembershipType() != null
                    ? req.getMembershipType().toUpperCase() : "STANDARD");
        } catch (IllegalArgumentException e) {
            type = Member.MembershipType.STANDARD;
        }

        Member member = Member.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .membershipType(type)
                .isActive(true)
                .build();
        return memberRepository.save(member);
    }

    public Member update(Long id, MemberRequest req) {
        Member member = findById(id);
        if (req.getName() != null) member.setName(req.getName());
        if (req.getEmail() != null) member.setEmail(req.getEmail());
        if (req.getPhone() != null) member.setPhone(req.getPhone());
        if (req.getAddress() != null) member.setAddress(req.getAddress());
        if (req.getMembershipType() != null) {
            try { member.setMembershipType(Member.MembershipType.valueOf(req.getMembershipType().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        return memberRepository.save(member);
    }

    public void deactivate(Long id) {
        Member member = findById(id);
        boolean hasActive = transactionRepository.existsByBookIdAndStatus(id, Transaction.Status.ISSUED);
        if (hasActive)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Member has unreturned books");
        member.setIsActive(false);
        memberRepository.save(member);
    }

    public List<Transaction> getHistory(Long id) {
        findById(id);
        return transactionRepository.findByMemberId(id);
    }
}
