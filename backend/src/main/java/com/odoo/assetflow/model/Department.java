package com.odoo.assetflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(name = "head_user_id")
    private Long headUserId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public Department() {}

    public Department(String name) {
        this.name = name;
        this.isActive = true;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getHeadUserId() { return headUserId; }
    public void setHeadUserId(Long headUserId) { this.headUserId = headUserId; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
