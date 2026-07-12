package com.odoo.assetflow.service;

import com.odoo.assetflow.model.Department;
import com.odoo.assetflow.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    
    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department createDepartment(String name, Long headUserId, Long parentId) {
        Department dept = new Department(name);
        dept.setHeadUserId(headUserId);
        dept.setParentId(parentId);
        return departmentRepository.save(dept);
    }

    public Department updateDepartment(Long id, String name, Long headUserId, Long parentId, Boolean isActive) {
        Department dept = departmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Department not found"));
        if (name != null) dept.setName(name);
        if (headUserId != null) dept.setHeadUserId(headUserId);
        if (parentId != null) dept.setParentId(parentId);
        if (isActive != null) dept.setIsActive(isActive);
        return departmentRepository.save(dept);
    }
}
