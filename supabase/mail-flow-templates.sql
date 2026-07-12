-- Greenplanet mail flow templates
-- Run this after supabase/schema.sql.

insert into public.mail_templates (slug, subject, preheader, body)
values
(
  'customer_welcome',
  'Velkommen til Greenplanet',
  'Vi har gemt din kundeprofil. Du skal ikke huske et password.',
  'Hej {{customer_name}}

Tak fordi du har oprettet en kundeprofil hos Greenplanet.

Vi har gemt dine kontakt- og adresseoplysninger, så det bliver nemmere at bestille næste gang.

Du skal ikke huske et password til Greenplanet. Når kundelogin åbner, logger du ind med din e-mailadresse og får tilsendt en engangskode eller et sikkert login-link.

Indtil da kan du bare svare på denne mail, hvis du vil have rettet eller slettet dine oplysninger.

Hos Greenplanet samler vi gaveæsker med udvalgte produkter til baby, barsel og velvære. Hver gave pakkes med omtanke, og vi sender gerne direkte til modtageren.

Kærlig hilsen
Greenplanet

CVR 44640376
Bøgevejen 6, 2850 Nærum'
),
(
  'order_confirmation',
  'Ordrebekræftelse {{order_number}}',
  'Vi har modtaget din ordre og sender dig videre i processen.',
  'Hej {{customer_name}}

Tak for din bestilling hos Greenplanet.

Vi har modtaget ordre {{order_number}} på i alt {{order_total}} kr. inkl. fragt.

Ordren indeholder:
{{order_lines}}

Levering:
{{delivery_method}}
{{delivery_name}}
{{delivery_address}}
{{delivery_date}}

Hvis gaven sendes direkte til modtageren, lægger vi ikke prisbilag i pakken. Eventuelle korttekster følger de enkelte gaver.

Du får en ny besked, når ordren er pakket eller sendt.

Kærlig hilsen
Greenplanet'
),
(
  'payment_received',
  'Betaling modtaget for {{order_number}}',
  'Din betaling er gået igennem, og vi gør ordren klar.',
  'Hej {{customer_name}}

Vi har modtaget betalingen for ordre {{order_number}}.

Nu gør vi gaven klar og pakker den efter de oplysninger, du har sendt til os.

Hvis du opdager en fejl i adresse, korttekst eller ønsket leveringsdato, så svar på denne mail hurtigst muligt.

Kærlig hilsen
Greenplanet'
),
(
  'order_sent',
  'Din Greenplanet-gave er sendt',
  'Ordre {{order_number}} er nu på vej.',
  'Hej {{customer_name}}

Din ordre {{order_number}} er nu sendt.

Levering:
{{delivery_name}}
{{delivery_address}}

Tak fordi du valgte Greenplanet. Vi håber, gaven skaber glæde hos modtageren.

Kærlig hilsen
Greenplanet'
),
(
  'admin_order_notification',
  'Ny betalt ordre {{order_number}}',
  'Der er kommet en ny betalt ordre i Greenplanet.',
  'Ny betalt ordre i Greenplanet

Ordre: {{order_number}}
Total: {{order_total}} kr.

Kunde:
{{customer_name}}
{{customer_email}}
{{customer_phone}}
{{customer_address}}

Ordren indeholder:
{{order_lines}}

Levering:
{{delivery_method}}
{{delivery_name}}
{{delivery_address}}
{{delivery_date}}
{{delivery_note}}

Log ind i admin for at pakke og opdatere status.'
)
on conflict (slug) do update set
  subject = excluded.subject,
  preheader = excluded.preheader,
  body = excluded.body,
  updated_at = now();
