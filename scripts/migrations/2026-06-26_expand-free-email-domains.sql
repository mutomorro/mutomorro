-- Expand is_free_email_domain — the original list missed international free providers
-- (yahoo.fr, yahoo.com.br, live.com.au, hotmail.fr, gmx.at, …). Those slipped through
-- as "work email" and got Apollo-enriched + counted as UK/work-email, which they're
-- not. Widening the list fixes enrichment eligibility, is_org_email, is_uk_contact and
-- the contact segments retroactively.
-- Date: 2026-06-26

CREATE OR REPLACE FUNCTION public.is_free_email_domain(d text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT lower(coalesce(d, '')) IN (
    -- Google / Microsoft / Apple / AOL
    'gmail.com','googlemail.com','icloud.com','me.com','mac.com','aol.com',
    'hotmail.com','hotmail.co.uk','hotmail.fr','hotmail.de','hotmail.it','hotmail.es','hotmail.ca','hotmail.com.au',
    'outlook.com','outlook.co.uk','outlook.fr','outlook.de','outlook.es','outlook.it','outlook.com.au',
    'live.com','live.co.uk','live.com.au','live.fr','live.de','live.it','live.ca','msn.com','windowslive.com',
    -- Yahoo (all regions)
    'yahoo.com','yahoo.co.uk','yahoo.co.in','yahoo.com.au','yahoo.com.br','yahoo.ca','yahoo.fr','yahoo.de',
    'yahoo.es','yahoo.it','yahoo.in','yahoo.com.mx','yahoo.com.sg','ymail.com','rocketmail.com','yahoo.com.hk',
    -- Privacy / modern
    'protonmail.com','proton.me','hey.com','fastmail.com','tutanota.com','zoho.com','gmx.com','gmx.co.uk',
    -- UK ISPs
    'btinternet.com','sky.com','virginmedia.com','ntlworld.com','blueyonder.co.uk','talktalk.net','tiscali.co.uk',
    -- Germany / Europe
    'gmx.de','gmx.net','gmx.at','web.de','t-online.de','freenet.de','laposte.net','orange.fr','wanadoo.fr',
    'free.fr','sfr.fr','libero.it','virgilio.it','tin.it','alice.it','terra.com.br','uol.com.br','bol.com.br',
    -- Russia / Asia
    'mail.ru','yandex.ru','yandex.com','inbox.ru','list.ru','bk.ru','qq.com','163.com','126.com','sina.com',
    'naver.com','daum.net','hanmail.net','rediffmail.com',
    -- Poland / Czech
    'wp.pl','o2.pl','onet.pl','interia.pl','seznam.cz',
    -- US ISPs
    'comcast.net','verizon.net','sbcglobal.net','cox.net','charter.net','att.net','bellsouth.net','optonline.net',
    'frontier.com','earthlink.net','mail.com',
    -- AU / CA / NZ ISPs
    'bigpond.com','optusnet.com.au','iinet.net.au','xtra.co.nz','shaw.ca','rogers.com','telus.net','sympatico.ca'
  );
$$;
