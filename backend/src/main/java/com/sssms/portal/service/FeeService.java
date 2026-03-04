package com.sssms.portal.service;

import com.sssms.portal.entity.FeeRecord;
import com.sssms.portal.entity.Student;
import com.sssms.portal.repository.FeeRepository;
import com.sssms.portal.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;

    // 1. Initialize Fee for a Student
    public void initializeFee(Long studentId, double amount) {
        Student student = studentRepository.findById(studentId).orElseThrow();

        FeeRecord record = feeRepository.findByStudentId(studentId)
                .orElse(FeeRecord.builder()
                        .student(student)
                        .paidAmount(0)
                        .build());

        record.setTotalFee(amount);
        feeRepository.save(record);
    }

    // 2. Record a Payment
    @Transactional
    public void recordPayment(Long studentId, double amount) {
        FeeRecord record = feeRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Fee record not initialized for student"));

        record.setPaidAmount(record.getPaidAmount() + amount);
        record.setLastPaymentDate(LocalDateTime.now());
        feeRepository.save(record);
    }

    // 3. Get All Records (For Admin Dashboard)
    public List<Map<String, Object>> getAllFeeRecords() {
        return feeRepository.findAll().stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("studentId", f.getStudent().getId()); // User ID
            map.put("name", f.getStudent().getFirstName() + " " + f.getStudent().getLastName());
            map.put("prn", f.getStudent().getPrn());
            map.put("total", f.getTotalFee());
            map.put("paid", f.getPaidAmount());
            map.put("scholarshipAmount", f.getScholarshipAmount());
            double effectiveBalance = f.getTotalFee() - f.getPaidAmount() - f.getScholarshipAmount();
            map.put("balance", Math.max(effectiveBalance, 0));
            map.put("status", effectiveBalance <= 0 ? "PAID" : "PENDING");
            map.put("scholarshipStatus", f.getStudent().getScholarshipStatus() != null
                    ? f.getStudent().getScholarshipStatus().name() : "NOT_APPLIED");
            return map;
        }).collect(Collectors.toList());
    }
}