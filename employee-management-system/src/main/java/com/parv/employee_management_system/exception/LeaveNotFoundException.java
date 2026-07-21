package com.parv.employee_management_system.exception;



public class LeaveNotFoundException extends RuntimeException {
     public LeaveNotFoundException(String message) {
        super(message);
    }
}
