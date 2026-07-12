package com.odoo.assetflow.service;

import com.odoo.assetflow.model.AssetCategory;
import com.odoo.assetflow.repository.AssetCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetCategoryService {
    
    private final AssetCategoryRepository assetCategoryRepository;

    public AssetCategoryService(AssetCategoryRepository assetCategoryRepository) {
        this.assetCategoryRepository = assetCategoryRepository;
    }

    public List<AssetCategory> getAllCategories() {
        return assetCategoryRepository.findAll();
    }

    public AssetCategory createCategory(String name, String description, String customFields) {
        AssetCategory category = new AssetCategory(name, description);
        category.setCustomFields(customFields);
        return assetCategoryRepository.save(category);
    }

    public AssetCategory updateCategory(Long id, String name, String description, String customFields, Boolean isActive) {
        AssetCategory category = assetCategoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        if (name != null) category.setName(name);
        if (description != null) category.setDescription(description);
        if (customFields != null) category.setCustomFields(customFields);
        if (isActive != null) category.setIsActive(isActive);
        return assetCategoryRepository.save(category);
    }
}
