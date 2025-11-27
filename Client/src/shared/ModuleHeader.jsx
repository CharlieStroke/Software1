import React from 'react';
import '../sharedCss/ModuleHeader.css';

const ModuleHeader = ({ 
  title, 
  subtitle, 
  buttonText, 
  buttonOnClick, 
  buttonIcon = '+', 
  showButton = true,
  additionalButtons = []
}) => {
  return (
    <div className="module-header">
      <div className="header-content">
        <h2 className="header-title">{title}</h2>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      {(showButton || additionalButtons.length > 0) && (
        <div className="header-actions">
          {additionalButtons.map((btn, index) => (
            <button
              key={index}
              className={btn.className || 'btn btn-secondary'}
              onClick={btn.onClick}
              disabled={btn.disabled}
            >
              {btn.icon && <span className="btn-icon">{btn.icon}</span>}
              {btn.text}
            </button>
          ))}
          {showButton && buttonText && (
            <button
              className="btn btn-primary"
              onClick={buttonOnClick}
            >
              {buttonIcon && <span className="btn-icon">{buttonIcon}</span>}
              {buttonText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleHeader;
