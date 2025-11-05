-- Add DELETE policy to premium_users table for GDPR compliance
-- This allows users to delete their own premium records

CREATE POLICY "Users can delete their own premium status"
ON premium_users
FOR DELETE
USING (auth.uid() = user_id);