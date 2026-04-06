const PoogiIcon = ({ size, color = "#FF8C42" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    {/* Thân tròn to */}
    <ellipse cx="12" cy="17.5" rx="8.4" ry="6" />
    {/* 2 ngón ngoài — nhỏ hơn, thấp hơn */}
    <ellipse cx="3.3"  cy="10"  rx="2.4" ry="3" />
    <ellipse cx="20.7" cy="10"  rx="2.4" ry="3" />
    {/* 2 ngón giữa — to hơn, cao hơn */}
    <ellipse cx="8.7"  cy="6.6" rx="3"   ry="3.9" />
    <ellipse cx="15.3" cy="6.6" rx="3"   ry="3.9" />
     <text
      x="12" y="33"
      textAnchor="middle"
      fontFamily="'Be Vietnam Pro', sans-serif"
      fontSize="8"
      fontWeight="700"
      fill={color}
    >
      Poogi
    </text>
  </svg>
);

export default PoogiIcon;