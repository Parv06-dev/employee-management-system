package com.parv.employee_management_system.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
@Entity
@Table(name="Leave_Request")//  hibernate ne jo table banaya uska naam ye rakho
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Leave {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="leave_id")
    Long leaveId;
    @ManyToOne
    @JoinColumn(name="emp_id")
     private Employee employee;

    @NotNull(message = "Date Cant Be Null")
    @Column(name="from_date",nullable = false)
    LocalDate fromDate;
    @NotNull(message = "Date Cant Be Null")
    @Column(name="to_date",nullable = false)
    LocalDate toDate;
    @NotBlank(message="Reason is Mandatary")
    @Column(name="reason",nullable = false)
    String reason;
    @Enumerated(EnumType.STRING)
    @Column(name="approved_status",nullable = false)
    LeaveStatus status;
    @ManyToOne
    @JoinColumn(name="approved_by")
     private Employee approvedBy;

}
