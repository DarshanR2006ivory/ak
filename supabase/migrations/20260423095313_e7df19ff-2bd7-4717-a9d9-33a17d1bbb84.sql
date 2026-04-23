
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  village TEXT,
  district TEXT,
  state TEXT,
  phone TEXT,
  qualification TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Mandi rates (vegetable market prices) - everyone can view, only authenticated can add
CREATE TABLE public.mandi_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vegetable TEXT NOT NULL,
  price_per_kg NUMERIC(10,2) NOT NULL,
  market_name TEXT NOT NULL,
  district TEXT,
  state TEXT,
  rate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mandi_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view rates" ON public.mandi_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users add own rates" ON public.mandi_rates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rates" ON public.mandi_rates FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own rates" ON public.mandi_rates FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Government schemes (seeded reference data, public read)
CREATE TABLE public.government_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT,
  benefits TEXT,
  apply_link TEXT,
  ministry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view schemes" ON public.government_schemes FOR SELECT USING (true);

-- Job opportunities
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  qualification_required TEXT NOT NULL,
  salary_range TEXT,
  job_type TEXT,
  description TEXT NOT NULL,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);

-- Emergency alerts
CREATE TABLE public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  region TEXT,
  message TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active alerts" ON public.emergency_alerts FOR SELECT USING (true);

-- updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, preferred_language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed schemes
INSERT INTO public.government_schemes (name, category, description, eligibility, benefits, apply_link, ministry) VALUES
('PM-KISAN', 'Agriculture', 'Income support of ₹6,000 per year to all landholding farmer families.', 'All small & marginal landholding farmer families', '₹6,000/year in 3 installments', 'https://pmkisan.gov.in', 'Ministry of Agriculture'),
('PMAY-G', 'Housing', 'Pradhan Mantri Awas Yojana - Gramin provides pucca houses to rural homeless.', 'Houseless families in rural areas as per SECC data', 'Up to ₹1.30 lakh assistance', 'https://pmayg.nic.in', 'Ministry of Rural Development'),
('MGNREGA', 'Employment', 'Guarantees 100 days of wage employment per year to rural households.', 'Adult member of rural household willing to do unskilled work', '100 days guaranteed work per household', 'https://nrega.nic.in', 'Ministry of Rural Development'),
('Ayushman Bharat', 'Health', 'Health insurance up to ₹5 lakh per family per year.', 'Families listed in SECC database', '₹5 lakh health cover per family', 'https://pmjay.gov.in', 'Ministry of Health'),
('PM Fasal Bima Yojana', 'Agriculture', 'Crop insurance scheme protecting farmers against crop loss.', 'All farmers growing notified crops', 'Insurance against natural calamities', 'https://pmfby.gov.in', 'Ministry of Agriculture'),
('Soil Health Card', 'Agriculture', 'Provides soil health cards every 2 years for nutrient management.', 'All farmers', 'Free soil testing & recommendations', 'https://soilhealth.dac.gov.in', 'Ministry of Agriculture'),
('Ujjwala Yojana', 'Energy', 'Free LPG connections to women from BPL households.', 'Women from BPL households', 'Free LPG connection + first refill', 'https://pmuy.gov.in', 'Ministry of Petroleum'),
('PM Mudra Yojana', 'Finance', 'Loans up to ₹10 lakh for small businesses and entrepreneurs.', 'Small business owners, entrepreneurs', 'Loans up to ₹10 lakh', 'https://mudra.org.in', 'Ministry of Finance');

-- Seed jobs
INSERT INTO public.jobs (title, company, location, qualification_required, salary_range, job_type, description, contact) VALUES
('Farm Worker', 'Greenfield Farms', 'Pune, Maharashtra', '8th Pass', '₹10,000-15,000/month', 'Full-time', 'Daily farm operations including planting, harvesting and irrigation.', 'jobs@greenfield.in'),
('Tractor Driver', 'AgroServices Co-op', 'Nashik, Maharashtra', '10th Pass + Driving License', '₹15,000-20,000/month', 'Full-time', 'Operate tractors for ploughing, sowing and transport.', '+91-9876543210'),
('Anganwadi Helper', 'Government of India', 'Multiple Districts', '10th Pass', '₹6,500/month', 'Government', 'Assist in pre-school activities and nutrition for children.', 'wcd.nic.in'),
('Dairy Farm Assistant', 'Amul Federation', 'Anand, Gujarat', 'No formal education required', '₹12,000-16,000/month', 'Full-time', 'Milking, feeding cattle and dairy maintenance.', 'careers@amul.com'),
('Solar Panel Installer', 'SunRural Pvt Ltd', 'Rajasthan', '10th Pass + ITI preferred', '₹18,000-25,000/month', 'Full-time', 'Install and maintain rooftop solar systems in villages.', '+91-9123456780'),
('ASHA Worker', 'NHM India', 'Pan-India', '8th Pass (Female)', '₹2,000-5,000/month + incentives', 'Part-time', 'Community health worker linking villagers to health services.', 'nhm.gov.in'),
('Handicraft Artisan', 'Khadi Gramodyog', 'Varanasi, UP', 'No formal education required', '₹8,000-15,000/month', 'Contract', 'Create traditional handicrafts and textiles.', 'kvic.gov.in'),
('Junior Engineer (Civil)', 'PWD Rural', 'Bihar', 'Diploma in Civil Engineering', '₹25,000-35,000/month', 'Government', 'Supervise rural road and infrastructure projects.', 'pwd.bih.nic.in');

-- Seed alerts
INSERT INTO public.emergency_alerts (title, alert_type, severity, region, message) VALUES
('Heavy Rainfall Warning', 'Weather', 'high', 'Maharashtra, Gujarat', 'IMD predicts heavy to very heavy rainfall in the next 48 hours. Farmers advised to delay irrigation.'),
('Locust Swarm Alert', 'Pest', 'medium', 'Rajasthan border districts', 'Locust swarms reported. Contact local agriculture office immediately.'),
('Free Vaccination Camp', 'Health', 'low', 'All Districts', 'Free livestock vaccination camp on this Sunday. Visit your nearest veterinary center.');
