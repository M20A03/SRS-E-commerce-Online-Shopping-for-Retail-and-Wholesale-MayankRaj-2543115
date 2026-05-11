import React from 'react';

const makeIcon = (label) => ({ size = 16, className = '', ...props }) => (
  React.createElement(
    'span',
    {
      'aria-hidden': 'true',
      className,
      ...props,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.7)),
        lineHeight: 1
      }
    },
    label
  )
);

export const ArrowRight = makeIcon('->');
export const ArrowLeft = makeIcon('<-');
export const Search = makeIcon('S');
export const ShieldCheck = makeIcon('SC');
export const Truck = makeIcon('T');
export const Store = makeIcon('St');
export const X = makeIcon('x');
export const Zap = makeIcon('Z');
export const ChevronLeft = makeIcon('<');
export const ChevronRight = makeIcon('>');
export const Star = makeIcon('*');
export const Package = makeIcon('Pk');
export const Eye = makeIcon('E');
export const ShoppingBag = makeIcon('Bag');
export const ShoppingCart = makeIcon('C');
export const Sparkles = makeIcon('Sp');
export const TriangleAlert = makeIcon('!');
export const Chrome = makeIcon('G');
export const Home = makeIcon('H');
export const LogOut = makeIcon('Out');
export const Moon = makeIcon('M');
export const Sun = makeIcon('Sun');
export const User = makeIcon('U');
export const Users = makeIcon('Us');
export const Plus = makeIcon('+');
export const Minus = makeIcon('-');
export const Facebook = makeIcon('FB');
export const Twitter = makeIcon('TW');
export const Instagram = makeIcon('IG');
export const Mail = makeIcon('@');
export const Phone = makeIcon('P');
export const MapPin = makeIcon('Map');
export const HeartHandshake = makeIcon('HH');
export const Copy = makeIcon('Copy');
export const Check = makeIcon('OK');
export const CreditCard = makeIcon('CC');
export const Smartphone = makeIcon('UPI');
export const HandCoins = makeIcon('COD');
export const CheckCircle = makeIcon('✓');
export const AlertCircle = makeIcon('!');
export const PackageCheck = makeIcon('P2');
export const CircleCheck = makeIcon('✓');
export const MapPinned = makeIcon('MP');
export const Trash2 = makeIcon('Del');
export const Calendar = makeIcon('Cal');