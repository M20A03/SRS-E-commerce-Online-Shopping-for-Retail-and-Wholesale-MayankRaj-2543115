import React from 'react';

const createMotionComponent = (Tag) => {
  const MotionComponent = React.forwardRef(({ children, ...props }, ref) => React.createElement(Tag, { ref, ...props }, children));

  MotionComponent.displayName = `Motion.${typeof Tag === 'string' ? Tag : 'Component'}`;
  return MotionComponent;
};

const motion = new Proxy({}, {
  get: (_, tag) => createMotionComponent(tag),
});

const AnimatePresence = ({ children }) => React.createElement(React.Fragment, null, children);

export { AnimatePresence, motion };