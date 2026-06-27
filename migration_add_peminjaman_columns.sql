-- Migration: Add missing columns to peminjaman table
-- This migration adds columns that exist in warehouse.sql but are missing from the actual database

-- Add kode_peminjaman column
ALTER TABLE peminjaman ADD COLUMN kode_peminjaman VARCHAR(20) NOT NULL DEFAULT '' AFTER id;

-- Add unique index for kode_peminjaman
ALTER TABLE peminjaman ADD UNIQUE INDEX idx_kode_peminjaman (kode_peminjaman);

-- Add jumlah column if it doesn't exist
ALTER TABLE peminjaman ADD COLUMN jumlah INT NOT NULL DEFAULT 1 AFTER barang_id;

-- Add check constraint for jumlah
ALTER TABLE peminjaman ADD CONSTRAINT chk_jumlah CHECK (jumlah > 0);

-- Add approved_by column if it doesn't exist
ALTER TABLE peminjaman ADD COLUMN approved_by INT AFTER jumlah;

-- Add foreign key for approved_by
ALTER TABLE peminjaman ADD CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Add index for approved_by
ALTER TABLE peminjaman ADD INDEX idx_approved_by (approved_by);

-- Add tanggal_kembali column if it doesn't exist
ALTER TABLE peminjaman ADD COLUMN tanggal_kembali DATE AFTER tanggal_jatuh_tempo;

-- Add alasan_penolakan column if it doesn't exist
ALTER TABLE peminjaman ADD COLUMN alasan_penolakan TEXT AFTER status;

-- Add updated_at column if it doesn't exist
ALTER TABLE peminjaman ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add missing indexes
ALTER TABLE peminjaman ADD INDEX idx_tanggal_pengajuan (tanggal_pengajuan);
ALTER TABLE peminjaman ADD INDEX idx_tanggal_jatuh_tempo (tanggal_jatuh_tempo);
