-- Function: Create new invite code (Improved zombie data handling)
CREATE OR REPLACE FUNCTION create_new_invite_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_couple_id UUID;
  v_real_couple_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- 1. Get user's couple_id
  SELECT couple_id INTO v_couple_id FROM public.users WHERE id = p_user_id;
  
  -- 2. Validate couple_id (Check if it really exists in couples table)
  IF v_couple_id IS NOT NULL THEN
    SELECT id INTO v_real_couple_id FROM public.couples WHERE id = v_couple_id;
    
    -- If couple row doesn't exist (zombie), treat as NULL
    IF v_real_couple_id IS NULL THEN
      v_couple_id := NULL;
    ELSE
      -- If couple exists, check if it already has a partner
      IF EXISTS (
        SELECT 1 FROM public.couples 
        WHERE id = v_real_couple_id 
        AND user1_id IS NOT NULL 
        AND user2_id IS NOT NULL
      ) THEN
        RAISE EXCEPTION 'User already has a partner';
      END IF;
    END IF;
  END IF;

  -- 3. If no valid couple exists, create a new one
  IF v_couple_id IS NULL THEN
    INSERT INTO public.couples (user1_id, start_date)
    VALUES (p_user_id, CURRENT_DATE)
    RETURNING id INTO v_couple_id;
    
    -- Update user with new couple_id
    UPDATE public.users 
    SET couple_id = v_couple_id 
    WHERE id = p_user_id;
  END IF;

  -- 4. Generate unique code
  LOOP
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.invite_codes WHERE code = v_code);
  END LOOP;

  -- 5. Set expiration (24 hours)
  v_expires_at := NOW() + INTERVAL '24 hours';

  -- 6. Create invite code
  INSERT INTO public.invite_codes (
    code, 
    couple_id, 
    created_by, 
    expires_at, 
    used
  ) VALUES (
    v_code, 
    v_couple_id, 
    p_user_id, 
    v_expires_at, 
    FALSE
  );

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
