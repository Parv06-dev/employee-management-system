package com.parv.employee_management_system.repository;
import com.parv.employee_management_system.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRepository extends JpaRepository<Leave,Long> {
}
