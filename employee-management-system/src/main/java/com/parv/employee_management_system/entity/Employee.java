package com.parv.employee_management_system.entity;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotBlank;
@Entity
@Table(name="employee")//  hibernate ne jo table banaya uska naam ye rakho
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="emp_id")// db mein ye column ko reference karo
    private Long empId;
    @Column(name="emp_name",nullable = false)// db mein ye naam ke column ko refer karo
    @NotBlank(message="Employee Name is Required")
    private String empName;
    @Column(name="emp_department",nullable = false)
    @NotBlank(message="Department is Required")
    private String empDepartment;
    @Column(name="emp_email",unique = true,nullable = false)// sql mein ye unique attributes the na so
    @NotBlank(message="Email is Required")
    @Email(message = "Invalid email")
    private String empEmail;
    @Column(name="emp_role",nullable = false)
    @NotBlank(message="Role is Required")
    private String empRole;
    @Column(name="emp_phno",unique = true,nullable = false)
    @NotBlank(message="Phone Number  is Required")
    @Pattern(regexp = "\\d{10}",message = "Phone Number Must Contain Exactly 10 Digits")
    private String empPhno;

}



