-- ==========================================
-- 情侣点菜系统 Supabase 数据库初始化脚本
-- 请在 Supabase 控制台的 "SQL Editor" 中执行本脚本
-- ==========================================

-- 1. 菜品表 (dishes)
CREATE TABLE IF NOT EXISTS public.dishes (
  id TEXT PRIMARY KEY,                           -- 菜品ID (兼容现有 ID 格式)
  space_id TEXT NOT NULL DEFAULT 'our_home',     -- 情侣专属小屋标识
  name TEXT NOT NULL,                            -- 菜名
  category TEXT NOT NULL,                        -- 分类: meat, veggie, soup, staple, dessert
  image TEXT,                                    -- 图片URL
  cooking_time INT NOT NULL DEFAULT 15,          -- 制作时间(分钟)
  difficulty TEXT NOT NULL DEFAULT 'easy',       -- 难度: easy, medium, hard
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,       -- 标签数组
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb, -- 食材列表 [{name, amount, unit}]
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,     -- 软删除标记
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 为菜品表创建加速索引
CREATE INDEX IF NOT EXISTS idx_dishes_space ON public.dishes(space_id) WHERE NOT is_deleted;

-- 2. 菜单与历史记录表 (menus)
-- 今晚最新的一条记录即为“今晚菜单”，所有历史记录按 submitted_at 倒序排列即为“历史菜单”
CREATE TABLE IF NOT EXISTS public.menus (
  id TEXT PRIMARY KEY,                           -- 订单唯一ID
  space_id TEXT NOT NULL DEFAULT 'our_home',     -- 情侣专属小屋标识
  menu_date DATE NOT NULL DEFAULT CURRENT_DATE,  -- 菜单日期
  status TEXT NOT NULL DEFAULT 'submitted',      -- 状态: submitted(已提交) | cooking(做饭中) | completed(已完成)
  note TEXT DEFAULT '',                          -- 女朋友的特别叮嘱备注
  dishes JSONB NOT NULL DEFAULT '[]'::jsonb,     -- 点餐时菜品快照
  checked_ingredients JSONB NOT NULL DEFAULT '[]'::jsonb, -- 采购已买食材名称数组 ['排骨', '大蒜']
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 为菜单表创建倒序索引
CREATE INDEX IF NOT EXISTS idx_menus_space_date ON public.menus(space_id, submitted_at DESC);

-- 3. 启用 Row Level Security (RLS) 行级安全策略
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- 4. 创建安全策略 (允许持有 anon key 的客户端安全访问与维护数据)
DROP POLICY IF EXISTS "anon_dishes_access" ON public.dishes;
CREATE POLICY "anon_dishes_access" ON public.dishes
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_menus_access" ON public.menus;
CREATE POLICY "anon_menus_access" ON public.menus
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. 开启 Supabase Realtime 实时推送广播 (使得 menus 表的变动能在两台手机间毫秒级同步)
ALTER PUBLICATION supabase_realtime ADD TABLE public.menus;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;
