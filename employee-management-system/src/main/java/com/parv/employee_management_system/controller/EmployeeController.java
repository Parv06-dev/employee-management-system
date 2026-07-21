package com.parv.employee_management_system.controller;
import com.parv.employee_management_system.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.parv.employee_management_system.entity.Employee;
import java.util.*;


@RestController
@RequestMapping("/employees")
public class EmployeeController {
    @Autowired
     private EmployeeService employeeService;
    @PostMapping
     public ResponseEntity<Employee> addEmployee(@Valid @RequestBody Employee employee){
         Employee savedEmployee =employeeService.addEmployee(employee);
         return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
    }
    @GetMapping
    public  ResponseEntity<List<Employee>> getAllEmployee(){
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }
    @GetMapping("/{id}")
     public Employee getEmployee(@PathVariable Long id){
       return  employeeService.getEmployeeById(id);
    }
    @PutMapping("/{id}")
    public Employee updateEmployee( @PathVariable long id,  @Valid @RequestBody Employee updatedEmployee){
        return employeeService.updatedEmployee(id,updatedEmployee);
    }
    @DeleteMapping("/{id}")
     public String deleteEmployee(@PathVariable Long id){
        return employeeService.deleteEmployee(id);// String because to display a message
    }
}
