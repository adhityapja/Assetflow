package com.odoo.assetflow.model;

import com.odoo.assetflow.model.enums.Role;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "department_id")
    private Long departmentId;

    public User() {}

    public User(String name, String email, String password, Role role) {
        this.name     = name;
        this.email    = email;
        this.password = password;
        this.role     = role;
        this.isActive = true;
    }

    public Long getId()            { return id; }
    public String getName()        { return name; }
    public void setName(String n)  { this.name = n; }
    public String getEmail()       { return email; }
    public void setEmail(String e) { this.email = e; }
    public String getPassword()    { return password; }
    public void setPassword(String p) { this.password = p; }
    public Role getRole()          { return role; }
    public void setRole(Role r)    { this.role = r; }
    public Boolean getIsActive()   { return isActive; }
    public void setIsActive(Boolean active) { this.isActive = active; }
    public Long getDepartmentId()  { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
}