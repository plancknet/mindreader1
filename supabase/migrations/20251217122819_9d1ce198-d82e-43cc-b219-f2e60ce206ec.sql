-- Allow admins to view all user videos
CREATE POLICY "Admins can view all user videos"
ON public.user_videos
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));