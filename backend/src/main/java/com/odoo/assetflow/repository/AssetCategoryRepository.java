package com.odoo.assetflow.repository;

import com.odoo.assetflow.model.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
}
