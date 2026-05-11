import React from 'react';

export const QRCodeSVG = ({ value = '', size = 200 }) => React.createElement(
  'div',
  {
    'aria-label': `QR code placeholder for ${value}`,
    style: {
      width: size,
      height: size,
      display: 'grid',
      placeItems: 'center',
      border: '1px solid currentColor',
      borderRadius: 12,
      fontSize: 18,
      fontWeight: 700
    }
  },
  'QR'
);