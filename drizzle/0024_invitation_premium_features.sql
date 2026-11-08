-- 0024: Invitation premium features
-- Adds story_timeline, custom_font, background_image_url, hero_photo_urls, enable_animations

ALTER TABLE "invitation_customization" ADD COLUMN IF NOT EXISTS "story_timeline" jsonb;
ALTER TABLE "invitation_customization" ADD COLUMN IF NOT EXISTS "custom_font" text DEFAULT 'Playfair Display';
ALTER TABLE "invitation_customization" ADD COLUMN IF NOT EXISTS "background_image_url" text;
ALTER TABLE "invitation_customization" ADD COLUMN IF NOT EXISTS "hero_photo_urls" jsonb;
ALTER TABLE "invitation_customization" ADD COLUMN IF NOT EXISTS "enable_animations" boolean DEFAULT false;
