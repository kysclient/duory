-- Add UPDATE policy for invite_codes
CREATE POLICY "Users can update own invite codes"
  ON public.invite_codes FOR UPDATE
  USING (created_by = auth.uid());
