
INSERT INTO users (email, display_name) VALUES
  ('demo@local.test','Demo'), ('boss@local.test','Boss')
ON CONFLICT DO NOTHING;

INSERT INTO profiles (user_id, avatar, level, xp, cash, hard_currency)
SELECT id, NULL, 1, 0, 100, 5 FROM users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO stats (user_id, energy, stamina, health, attack, defense)
SELECT id, 10, 10, 100, 2, 2 FROM users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO items (name, slot, rarity, attack_boost, defense_boost, price_soft, price_hard) VALUES
  ('Pocket Knife','weapon','common',2,0,50,0),
  ('Leather Jacket','armor','common',0,2,60,0),
  ('Tommy Gun','weapon','rare',8,0,0,5)
ON CONFLICT DO NOTHING;

INSERT INTO jobs (name, tier, energy_cost, reward_xp, reward_cash) VALUES
  ('Pickpocket',1,1,1,20),
  ('Backroom Deal',1,2,2,50),
  ('Warehouse Heist',2,4,6,120)
ON CONFLICT DO NOTHING;

INSERT INTO properties (name, base_income, upkeep) VALUES
  ('Street Stall',10,0), ('Speakeasy',30,2), ('Casino',100,10)
ON CONFLICT DO NOTHING;

INSERT INTO clans (name, tag) VALUES ('The Family','FAM'), ('Night Owls','OWL')
ON CONFLICT DO NOTHING;
