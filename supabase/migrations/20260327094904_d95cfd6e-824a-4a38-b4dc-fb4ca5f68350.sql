
-- Create app_role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Savings table
CREATE TABLE public.savings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'MTN',
  duration_days integer NOT NULL DEFAULT 0,
  lock_until timestamp with time zone,
  withdrawn boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own savings" ON public.savings
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings" ON public.savings
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings" ON public.savings
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all savings" ON public.savings
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own expenses" ON public.expenses
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all expenses" ON public.expenses
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Budgets table
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own budget" ON public.budgets
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own budget" ON public.budgets
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget" ON public.budgets
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all budgets" ON public.budgets
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles" ON public.profiles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
