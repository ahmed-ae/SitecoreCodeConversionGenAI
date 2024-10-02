import React from 'react';

interface GoogleTagManagerProps {
  gtmId: string;
}

export const GoogleTagManagerWithScript: React.FC<GoogleTagManagerProps> = ({ gtmId }) => {
  if (!gtmId) {
    return null; // Don't render anything if gtmId is empty or null
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  );
};
export default GoogleTagManagerWithScript;

export const GoogleTagManagerWithoutScript: React.FC<GoogleTagManagerProps> = ({ gtmId }) => {
    if (!gtmId) {
      return null; // Don't render anything if gtmId is empty or null
    }
    return (
      <>        
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      </>
    );
  };
  