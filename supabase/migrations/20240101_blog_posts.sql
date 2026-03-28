-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  hero_image TEXT,
  author TEXT DEFAULT 'FindaGuy Team',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  related_category_slug TEXT,
  related_suburb TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  read_time_mins INT DEFAULT 5,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug      ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_category  ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published, published_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed 10 launch posts
INSERT INTO blog_posts (title, slug, excerpt, category, related_category_slug, related_suburb, is_published, published_at, read_time_mins) VALUES
('How to Find a Reliable Plumber in Durban', 'find-reliable-plumber-durban',
 'Burst pipe? Blocked drain? Here''s exactly what to look for when hiring a plumber across eThekwini.',
 'home-services', 'plumbing', NULL, true, NOW(), 4),

('Top 10 Hair Salons in Umhlanga 2025', 'top-hair-salons-umhlanga-2025',
 'We reviewed the best hair salons in Umhlanga — from luxury blow-outs to everyday cuts.',
 'durban-local', 'beauty-wellness', 'Umhlanga', true, NOW(), 5),

('What to Look for When Hiring an Electrician in eThekwini', 'hire-electrician-ethekwini',
 'COC certificates, licensing and red flags to watch for when hiring an electrician in Durban.',
 'home-services', 'electrical', NULL, true, NOW(), 4),

('The Rise of Home Bakers in Durban — Meet the Makers', 'home-bakers-durban-makers',
 'From Instagram to oven: Durban''s home baking community is thriving. Here are the makers to know.',
 'maker-stories', 'local-makers', NULL, true, NOW(), 6),

('How to Claim Your Free Business Listing on FindaGuy', 'claim-free-business-listing-findaguy',
 'Step-by-step guide to claiming your listing, adding photos, and getting your first reviews.',
 'business-tips', NULL, NULL, true, NOW(), 3),

('Best Bunny Chow in Durban — Local Picks', 'best-bunny-chow-durban',
 'From the original Glenwood recipe to modern twists — Durban''s best bunny chow, ranked.',
 'durban-local', 'food-restaurants', 'Durban', true, NOW(), 5),

('Small Business Owners: How to Get More Reviews', 'get-more-reviews-small-business',
 'Practical tactics to ethically grow your reviews on FindaGuy and Google — used by top-rated Durban businesses.',
 'business-tips', NULL, NULL, true, NOW(), 4),

('Durban''s Best Car Mechanics — Verified and Reviewed', 'best-car-mechanics-durban',
 'We''ve found the most-trusted mechanics across Durban — verified, reviewed, and ready to help.',
 'durban-local', 'automotive', NULL, true, NOW(), 5),

('Starting a Home Business in KZN — What You Need to Know', 'start-home-business-kzn',
 'Permits, registration, taxes and how to get your first customers. A practical guide for KZN entrepreneurs.',
 'business-tips', 'local-makers', NULL, true, NOW(), 7),

('How FindaGuy Verifies Every Business Listing', 'how-findaguy-verifies-listings',
 'Our verification process — from phone confirmation to ID checks — so you always know who you''re dealing with.',
 'industry-news', NULL, NULL, true, NOW(), 3)
ON CONFLICT (slug) DO NOTHING;
