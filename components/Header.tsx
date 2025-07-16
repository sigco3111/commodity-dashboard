
import React from 'react';

const ChartIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

interface HeaderProps {
    onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const LogoContainer = onLogoClick ? 'button' : 'div';
  const props = onLogoClick ? { onClick: onLogoClick, className: "flex items-center space-x-3 text-left" } : {className: "flex items-center space-x-3"};

  return (
    <header className="bg-brand-secondary/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <LogoContainer {...props}>
            <ChartIcon />
            <h1 className="text-xl md:text-2xl font-bold text-brand-text">실시간 원자재 대시보드</h1>
          </LogoContainer>
        </div>
      </div>
    </header>
  );
};

export default Header;
