-- Add the 8 banner image assets to bannerimages so hero banner links work.
-- Run this once (e.g. mysql < database/insert_banner_images.sql or run in your DB client).
-- Assumes bannerid = 1 exists in banner table. Adjust bannerid if needed.
--
-- Optional: to have only these 8 images, uncomment and run the line below first:
-- DELETE FROM bannerimages WHERE bannerid = 1;

INSERT INTO bannerimages (ImageSrc, ImageUrl, ImagePosition, bannerid) VALUES
  ('AAK322_Banner.jpg', NULL, 1, 1),
  ('CB763_Banner (S650).jpg', NULL, 2, 1),
  ('CJR760_Banner_S650.jpg', NULL, 3, 1),
  ('HCS760_Banner_S650.jpg', NULL, 4, 1),
  ('homebanner_challenger.jpg', NULL, 5, 1),
  ('homebanner_s650550.jpg', NULL, 6, 1),
  ('S650 Mustang_Banner.jpg', NULL, 7, 1),
  ('SP086-88_Banner_S650.webp', NULL, 8, 1);
