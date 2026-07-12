package com.odoo.assetflow.service;

import com.odoo.assetflow.dto.AssetDTO;
import com.odoo.assetflow.model.Asset;
import com.odoo.assetflow.model.User;
import com.odoo.assetflow.model.enums.AssetStatus;
import com.odoo.assetflow.repository.AssetRepository;
import com.odoo.assetflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AssetService(AssetRepository assetRepository, UserRepository userRepository, NotificationService notificationService) {
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<AssetDTO> getAllAssets() {
        List<Asset> assets = assetRepository.findAll();
        
        // Fetch users to map names
        List<Long> userIds = assets.stream()
                .filter(a -> a.getAssignedUserId() != null)
                .map(Asset::getAssignedUserId)
                .distinct()
                .collect(Collectors.toList());
                
        Map<Long, String> userNames = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName));

        return assets.stream().map(a -> mapToDTO(a, userNames.get(a.getAssignedUserId()))).collect(Collectors.toList());
    }

    @Transactional
    public AssetDTO createAsset(String name, String serialNumber, String category, String location, boolean isSharedBookable) {
        Asset asset = new Asset();
        asset.setName(name);
        asset.setAssetTag(serialNumber);
        asset.setCategory(category);
        asset.setLocation(location);
        asset.setStatus(AssetStatus.AVAILABLE);
        asset.setSharedBookable(isSharedBookable);
        
        return mapToDTO(assetRepository.save(asset), null);
    }

    @Transactional
    public AssetDTO allocateAsset(Long assetId, Long userId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        
        if (asset.getStatus() == AssetStatus.ALLOCATED || asset.getAssignedUserId() != null) {
            throw new RuntimeException("Asset is already allocated");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        asset.setAssignedUserId(userId);
        asset.setStatus(AssetStatus.ALLOCATED);
        assetRepository.save(asset);
        
        notificationService.createNotification(userId, "You have been assigned asset: " + asset.getName() + " (" + asset.getAssetTag() + ")", "INFO");
        
        return mapToDTO(asset, user.getName());
    }

    @Transactional
    public AssetDTO deallocateAsset(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
                
        asset.setAssignedUserId(null);
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);
        
        return mapToDTO(asset, null);
    }
    
    @Transactional
    public void requestTransfer(Long assetId, Long requesterId, String reason) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
                
        if (asset.getStatus() != AssetStatus.ALLOCATED) {
            throw new RuntimeException("Only allocated assets can be transferred");
        }
        
        // In a real system, this would create a TransferRequest entity.
        // For the hackathon Phase 3, we just accept the request.
        System.out.println("Transfer requested for asset " + assetId + " by " + requesterId + " reason: " + reason);
    }

    private AssetDTO mapToDTO(Asset asset, String userName) {
        return new AssetDTO(
                asset.getId(),
                asset.getName(),
                asset.getAssetTag(),
                asset.getCategory(),
                asset.getLocation(),
                asset.getStatus(),
                asset.getAssignedUserId(),
                userName,
                "2024-01-01", // Mock purchase date for UI
                asset.isSharedBookable()
        );
    }
}
