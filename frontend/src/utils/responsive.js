/* Mobile Responsive Utility Functions */

export const isMobile = () => window.innerWidth <= 768;
export const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;
export const isDesktop = () => window.innerWidth > 1024;

/* Responsive Style Helper */
export const responsiveStyle = (desktop, mobile) => {
  return isMobile() ? mobile : desktop;
};

/* Responsive Padding/Margin */
export const responsivePadding = (desktopValue, mobileValue) => {
  return {
    padding: isMobile() ? mobileValue : desktopValue,
  };
};

/* Responsive Font Size */
export const responsiveFontSize = (desktopSize, mobileSize) => {
  return {
    fontSize: isMobile() ? mobileSize : desktopSize,
  };
};

/* Touch-friendly Button Styles */
export const touchFriendlyButton = {
  minHeight: '44px',
  minWidth: '44px',
  cursor: 'pointer',
};

/* Responsive Grid */
export const responsiveGrid = (desktopCols, mobileCols) => {
  return {
    display: 'grid',
    gridTemplateColumns: isMobile() 
      ? `repeat(${mobileCols}, 1fr)` 
      : `repeat(${desktopCols}, 1fr)`,
    gap: isMobile() ? '12px' : '20px',
  };
};
