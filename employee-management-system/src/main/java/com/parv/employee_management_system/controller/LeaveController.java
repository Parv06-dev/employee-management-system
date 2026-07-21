package com.parv.employee_management_system.controller;
import com.parv.employee_management_system.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.parv.employee_management_system.entity.Leave;

import java.util.List;

@RestController
@RequestMapping("/leaves")
public class LeaveController {
    @Autowired
    private LeaveService leaveService;
    @PostMapping
    public ResponseEntity<Leave> applyLeave(@Valid @RequestBody Leave leave){
        Leave updated =leaveService.applyLeave(leave);
        return new ResponseEntity<>(updated, HttpStatus.CREATED);
    }
    @GetMapping
    public  ResponseEntity<List<Leave>> getAllLeaves(){
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }
    @GetMapping("/{id}")
    public ResponseEntity<Leave> getLeaveByid(@PathVariable Long id){
        return ResponseEntity.ok(leaveService.getLeaveById(id));
    }
    @PutMapping("/{id}/approve")
     public ResponseEntity<Leave> approveLeave(@PathVariable Long id){
        return ResponseEntity.ok(leaveService.approveLeave(id));
    }
    @PutMapping("/{id}/reject")
    public ResponseEntity<Leave> rejectLeave(@PathVariable Long id){
        return ResponseEntity.ok(leaveService.rejectLeave(id));}



}
