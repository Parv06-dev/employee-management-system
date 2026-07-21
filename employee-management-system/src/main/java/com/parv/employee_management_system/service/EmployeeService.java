package com.parv.employee_management_system.service;
import com.parv.employee_management_system.exception.EmployeeNotFoundException;
import com.parv.employee_management_system.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.parv.employee_management_system.entity.Employee;
import java.util.*;
@Service
public class EmployeeService {
    @Autowired
     private EmployeeRepository employeeRepository;
    public Employee addEmployee(Employee employee){
        //checks
        boolean emailExists=employeeRepository.existsByEmpEmail(employee.getEmpEmail());
        boolean phoneExists=employeeRepository.existsByEmpPhno(employee.getEmpPhno());
        if(emailExists){
            System.out.println("Email Already Exists");
        }
        else if(phoneExists){
            System.out.println("Phone Number already Exists");
        }
             return employeeRepository.save(employee);

    }
        public List<Employee> getAllEmployees(){
            return employeeRepository.findAll();
        }
        public Employee getEmployeeById(Long id){
         return employeeRepository.findById(id).orElseThrow(() -> new EmployeeNotFoundException("Employee Not Found"));
        }
        public Employee updatedEmployee(Long id,Employee updatedEmployee){
         Employee existingEmployee=employeeRepository.findById(id).orElseThrow(() -> new EmployeeNotFoundException("Employee Not Found"));
         existingEmployee.setEmpName(updatedEmployee.getEmpName());
         existingEmployee.setEmpDepartment(updatedEmployee.getEmpDepartment());
         existingEmployee.setEmpEmail(updatedEmployee.getEmpEmail());
         existingEmployee.setEmpPhno(updatedEmployee.getEmpPhno());
         existingEmployee.setEmpRole(updatedEmployee.getEmpRole());
         employeeRepository.save(existingEmployee);
         return existingEmployee;
        }
        public String  deleteEmployee(long id){
            Employee existingEmployee=employeeRepository.findById(id).orElseThrow(() -> new EmployeeNotFoundException("Employee Not Found"));
            employeeRepository.deleteById(id);
            return "Employee Deleted SuccessFully";
        }

}
