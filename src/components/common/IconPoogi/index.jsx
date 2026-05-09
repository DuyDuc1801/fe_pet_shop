// Đường dẫn ví dụ: src/components/icons/PawIcon.jsx
import React from 'react';

const PoogiIcon = ({ size = 22, color = "currentColor", style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
        <ellipse cx="9.5" cy="6" rx="2" ry="3.5" />
        <ellipse cx="14.5" cy="6" rx="2" ry="3.5" />
        <ellipse cx="5" cy="9.5" rx="1.75" ry="2.5" />
        <ellipse cx="19" cy="9.5" rx="1.75" ry="2.5" />
        <path d="M12 10c-3.5 0-7 2-7 5.5 0 2.5 2 4.5 7 4.5s7-2 7-4.5C19 12 15.5 10 12 10z" />
    </svg>
);

export default PoogiIcon;