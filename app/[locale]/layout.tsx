import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import '../globals.css';

export function generateStaticParams() {
  return [{ locale: 'pt' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let messages;
  try {
    messages = {
      ...(await import(`@/messages/${locale}/common.json`)).default,
      ...(await import(`@/messages/${locale}/home.json`)).default,
      ...(await import(`@/messages/${locale}/auth.json`)).default,
      ...(await import(`@/messages/${locale}/campaigns.json`)).default,
      ...(await import(`@/messages/${locale}/insights.json`)).default,
      ...(await import(`@/messages/${locale}/optimizations.json`)).default,
      ...(await import(`@/messages/${locale}/setup.json`)).default,
      ...(await import(`@/messages/${locale}/errors.json`)).default,
      ...(await import(`@/messages/${locale}/validation.json`)).default,
    };
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen bg-black text-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
