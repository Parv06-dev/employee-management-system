package com.parv.employee_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.parv.employee_management_system.entity.Employee;
public interface EmployeeRepository extends JpaRepository<Employee,Long> {
 boolean existsByEmpEmail(String empEmail);
 boolean existsByEmpPhno(String empPhno);
}
