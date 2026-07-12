package com.odoo.assetflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "asset_categories")
public class AssetCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "custom_fields", columnDefinition = "TEXT")
    private String customFields; // JSON string of optional fields

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public AssetCategory() {}

    public AssetCategory(String name, String description) {
        this.name = name;
        this.description = description;
        this.isActive = true;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCustomFields() { return customFields; }
    public void setCustomFields(String customFields) { this.customFields = customFields; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
