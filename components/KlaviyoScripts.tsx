'use client';

import { useEffect } from 'react';

const COMPANY_ID = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID || 'WCHubr';
const KLAVIYO_SRC = `https://static.klaviyo.com/onsite/js/${COMPANY_ID}/klaviyo.js?company_id=${COMPANY_ID}`;
const INIT_SNIPPET = `
  !function(){
    if (!window.klaviyo) {
      window._klOnsite = window._klOnsite || [];
      try {
        window.klaviyo = new Proxy({}, {
          get: function(target, key) {
            if (key === 'push') {
              return function() {
                var args;
                (args = window._klOnsite).push.apply(args, arguments);
              };
            }
            return function() {
              for (var len = arguments.length, args = new Array(len), i = 0; i < len; i++) {
                args[i] = arguments[i];
              }
              var cb = typeof args[args.length - 1] === 'function' ? args.pop() : void 0;
              return new Promise(function(resolve) {
                window._klOnsite.push([key].concat(args, [function(result) {
                  cb && cb(result);
                  resolve(result);
                }]));
              });
            };
          }
        });
      } catch (err) {
        window.klaviyo = window.klaviyo || [];
        window.klaviyo.push = function() {
          var args;
          (args = window._klOnsite).push.apply(args, arguments);
        };
      }
    }
  }();
`;

export function KlaviyoScripts() {
  useEffect(() => {
    if (!COMPANY_ID) {
      console.warn('Klaviyo company id missing');
      return;
    }

    if (!document.getElementById('klaviyo-lib')) {
      const script = document.createElement('script');
      script.id = 'klaviyo-lib';
      script.async = true;
      script.src = KLAVIYO_SRC;
      document.body.appendChild(script);
    }

    if (!document.getElementById('klaviyo-inline-init')) {
      const inline = document.createElement('script');
      inline.id = 'klaviyo-inline-init';
      inline.innerHTML = INIT_SNIPPET;
      document.body.appendChild(inline);
    }
  }, []);

  return null;
}
