-- Add new fields to invitation_customization for additional features

-- Gift accounts: JSONB array of gift account information (bank, e-wallet, etc.)
ALTER TABLE "invitation_customization" ADD COLUMN "gift_accounts" jsonb;

-- Video URL: Link to a video (YouTube embed or direct URL)
ALTER TABLE "invitation_customization" ADD COLUMN "video_url" text;

-- Live stream URL: Link to live streaming service
ALTER TABLE "invitation_customization" ADD COLUMN "live_stream_url" text;
