package com.odoo.assetflow.dto;

import com.odoo.assetflow.model.enums.AssetStatus;

public record AssetDTO(
    Long id,
    String name,
    String serialNumber,
    String category,
    String location,
    AssetStatus status,
    Long assignedUserId,
    String assignedUserName,
    String purchaseDate,
    boolean isSharedBookable
) {}
