const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
  'throwaway.email', 'yopmail.com', 'getairmail.com', 'trashmail.com',
  'maildrop.cc', 'jetable.org', 'spamgourmet.com', 'dispostable.com',
  'temp-mail.org', 'fakeinbox.com', 'mailnator.com', 'mailexpire.com',
  'sharklasers.com', 'guerrillamail.org', 'guerrillamail.biz', 'grr.la',
  'tempemail.net', 'mbox.re', 'filzmail.com', 'mohmal.com',
  'temp-mail.lat', 'temp-inbox.com', 'tempail.com', 'eyepaste.com',
  'mailmetrash.com', 'maileater.com', 'sogetthis.com', 'spambox.us',
  'spambox.info', 'spam.la', 'mytrashmail.com', 'mt2009.com',
  'trash2009.com', 'trashymail.com', 'tyldd.com', 'uggsrock.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'mailexpire.com',
  'poofy.org', 'thankyou2010.com', 'trash-me.com', 'trash2009.com',
  'mt2009.com', 'trashymail.com', 'tyldd.com', 'uggsrock.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'tempemail.co', 'burnermail.io', 'inboxkitten.com',
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}
