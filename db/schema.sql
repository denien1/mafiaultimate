
-- Core tables for a mafia-like social RPG
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  banned BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar TEXT,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  cash INT NOT NULL DEFAULT 0,
  hard_currency INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  energy INT NOT NULL DEFAULT 10,
  stamina INT NOT NULL DEFAULT 10,
  health INT NOT NULL DEFAULT 100,
  attack INT NOT NULL DEFAULT 1,
  defense INT NOT NULL DEFAULT 1,
  last_regen_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slot TEXT, -- weapon, armor, etc.
  rarity TEXT,
  attack_boost INT NOT NULL DEFAULT 0,
  defense_boost INT NOT NULL DEFAULT 0,
  price_soft INT NOT NULL DEFAULT 0,
  price_hard INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id INT REFERENCES items(id) ON DELETE CASCADE,
  qty INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tier INT NOT NULL DEFAULT 1,
  energy_cost INT NOT NULL DEFAULT 1,
  reward_xp INT NOT NULL DEFAULT 1,
  reward_cash INT NOT NULL DEFAULT 10,
  req_items JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS job_runs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id INT REFERENCES jobs(id) ON DELETE SET NULL,
  result TEXT NOT NULL,
  rewards JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  base_income INT NOT NULL DEFAULT 10,
  upkeep INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS property_ownership (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id INT REFERENCES properties(id) ON DELETE CASCADE,
  qty INT NOT NULL DEFAULT 0,
  last_claimed_at TIMESTAMP,
  PRIMARY KEY (user_id, property_id)
);

CREATE TABLE IF NOT EXISTS clans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT UNIQUE,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS clan_members (
  clan_id INT REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY (clan_id, user_id)
);

CREATE TABLE IF NOT EXISTS pvp_fights (
  id SERIAL PRIMARY KEY,
  attacker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  defender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  result TEXT NOT NULL,
  delta_cash INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS login_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  used_at TIMESTAMP
);


-- RBAC
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Stripe+SKU model
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_product_id TEXT
);

CREATE TABLE IF NOT EXISTS prices (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'usd',
  unit_amount INT NOT NULL, -- cents
  active BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_price_id TEXT
);

ALTER TABLE items ADD COLUMN IF NOT EXISTS product_id INT REFERENCES products(id);

INSERT INTO products (name, description) 
  VALUES ('Hard Currency Pack', '100 gems') 
  ON CONFLICT DO NOTHING;

INSERT INTO prices (product_id, currency, unit_amount)
SELECT id, 'usd', 499 FROM products WHERE name='Hard Currency Pack'
ON CONFLICT DO NOTHING;
