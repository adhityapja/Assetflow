package com.odoo.assetflow.dto;

import java.util.List;

public class AuditBatchPayload {
    private Long auditCycleId;
    private List<AuditBatchItem> items;

    public AuditBatchPayload() {}

    public Long getAuditCycleId() { return auditCycleId; }
    public void setAuditCycleId(Long auditCycleId) { this.auditCycleId = auditCycleId; }

    public List<AuditBatchItem> getItems() { return items; }
    public void setItems(List<AuditBatchItem> items) { this.items = items; }

    public static class AuditBatchItem {
        private Long assetId;
        private String result;
        private String notes;

        public AuditBatchItem() {}

        public Long getAssetId() { return assetId; }
        public void setAssetId(Long assetId) { this.assetId = assetId; }

        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
