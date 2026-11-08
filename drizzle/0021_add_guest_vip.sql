-- Add `is_vip` column to `guests` table

ALTER TABLE "guests" ADD COLUMN "is_vip" boolean NOT NULL DEFAULT false;
