package com.parv.employee_management_system.service;
import com.parv.employee_management_system.entity.Leave;
import com.parv.employee_management_system.entity.LeaveStatus;
import com.parv.employee_management_system.repository.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.parv.employee_management_system.exception.*;

import java.lang.module.ResolutionException;
import java.util.*;
@Service
public class LeaveService {
    @Autowired
    private  LeaveRepository leaveRepository;
    public Leave applyLeave(Leave leave){
        leave.setStatus(LeaveStatus.PENDING);
        return leaveRepository.save(leave);
    }
    public List<Leave>getAllLeaves(){
        return leaveRepository.findAll();
    }
    public Leave getLeaveById(Long id){
        return leaveRepository.findById(id).orElseThrow(()-> new LeaveNotFoundException("Leave Id Not Found"));
    }
    public Leave approveLeave(Long id){
        Leave leave =getLeaveById(id);
        if(leave.getStatus().equals(LeaveStatus.PENDING)){
        leave.setStatus(LeaveStatus.Approved);
        return leaveRepository.save(leave);}
        else {
            throw new IllegalStateException("This Leave request has Already been Processed");
        }
    }
    public Leave rejectLeave(Long id){
        Leave leave =getLeaveById(id);
        if(leave.getStatus().equals(LeaveStatus.PENDING)){
            leave.setStatus(LeaveStatus.REJECTED);
            return leaveRepository.save(leave);}
        else {
            throw new IllegalStateException("This Leave request has Already been Processed");
        }
    }
}
