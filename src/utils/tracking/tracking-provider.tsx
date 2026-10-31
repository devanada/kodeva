'use client';

import { useEffect } from 'react';

import Script from 'next/script';

import { captureUtm } from './utm';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Stores UTM parameters on first landing and loads GTM (only when an id is configured) after the page is interactive,
// so tracking never competes with the first paint.
export function TrackingProvider() {
  useEffect(() => {
    captureUtm();
  }, []);

  if (!GTM_ID) {
    return null;
  }

  return (
    <Script id='gtm' strategy='afterInteractive'>
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}
