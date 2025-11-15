import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['pt', 'en'] as const;
export const defaultLocale = 'pt' as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: {
      ...(await import(`./messages/${locale}/common.json`)).default,
      ...(await import(`./messages/${locale}/home.json`)).default,
      ...(await import(`./messages/${locale}/auth.json`)).default,
      ...(await import(`./messages/${locale}/campaigns.json`)).default,
      ...(await import(`./messages/${locale}/insights.json`)).default,
      ...(await import(`./messages/${locale}/optimizations.json`)).default,
      ...(await import(`./messages/${locale}/setup.json`)).default,
      ...(await import(`./messages/${locale}/errors.json`)).default,
      ...(await import(`./messages/${locale}/validation.json`)).default,
    }
  };
});
