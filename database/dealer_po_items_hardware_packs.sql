-- Add hardware pack IDs to dealer PO line items (optional multi-select per line).
-- Run once; if column already exists, ignore the error.

ALTER TABLE dealer_po_items
  ADD COLUMN hardware_pack_ids varchar(255) DEFAULT NULL COMMENT 'Comma-separated product IDs of hardware packs';
