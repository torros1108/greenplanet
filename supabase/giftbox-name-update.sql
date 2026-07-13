update public.giftboxes
set
  title = 'Mors Timeout',
  updated_at = now()
where legacy_id = 'g1';
