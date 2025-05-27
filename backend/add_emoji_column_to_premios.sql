-- Migration script to add emoji column to premios table
ALTER TABLE premios
ADD COLUMN emoji VARCHAR(10) DEFAULT NULL;
