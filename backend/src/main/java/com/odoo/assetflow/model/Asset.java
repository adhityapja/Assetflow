package com.odoo.assetflow.model;

import com.odoo.assetflow.model.enums.AssetStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "asset_tag", nullable = false, unique = true, length = 50)
    private String assetTag;

    @Column(name = "is_shared_bookable", nullable = false)
    private boolean isSharedBookable = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssetStatus status = AssetStatus.AVAILABLE;

    @Column(nullable = false, length = 100)
    private String category = "Hardware";

    @Column(nullable = false, length = 100)
    private String location = "HQ";

    @Column(name = "assigned_user_id")
    private Long assignedUserId;

    public Asset() {}

    public Asset(String name, String assetTag, boolean isSharedBookable, AssetStatus status) {
        this.name             = name;
        this.assetTag         = assetTag;
        this.isSharedBookable = isSharedBookable;
        this.status           = status;
    }

    public Long getId()                         { return id; }
    public String getName()                     { return name; }
    public void setName(String n)               { this.name = n; }
    public String getAssetTag()                 { return assetTag; }
    public void setAssetTag(String t)           { this.assetTag = t; }
    public boolean isSharedBookable()           { return isSharedBookable; }
    public void setSharedBookable(boolean b)    { this.isSharedBookable = b; }
    public AssetStatus getStatus()              { return status; }
    public void setStatus(AssetStatus s)        { this.status = s; }
    public String getCategory()                 { return category; }
    public void setCategory(String c)           { this.category = c; }
    public String getLocation()                 { return location; }
    public void setLocation(String l)           { this.location = l; }
    public Long getAssignedUserId()             { return assignedUserId; }
    public void setAssignedUserId(Long id)      { this.assignedUserId = id; }
}
