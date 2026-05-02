import React from 'react';

export default {
  title: 'Design System/Tokens',
};

const designTokens = {
  colors: {
    primaryGold: '#FFCC00',
    deepCharcoal: '#1B1C1C',
    pureWhite: '#FCF9F8',
    surfaceGrey: '#F6F3F2',
    verificationGreen: '#27AE60',
  },
  typography: {
    primaryFont: 'Manrope, sans-serif',
    headings: {
      fontWeight: '700-900',
    },
    body: {
      fontWeight: '400-500',
    },
  },
  geometry: {
    radius: '4px',
  },
};

const ColorSwatch = ({ color, name }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
    <div
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: color,
        border: '1px solid #ccc',
        marginRight: '1rem',
      }}
    />
    <div>
      <strong>{name}</strong>
      <br />
      <span>{color}</span>
    </div>
  </div>
);

export const Colors = () => (
  <div>
    <h1>Color Palette</h1>
    {Object.entries(designTokens.colors).map(([name, color]) => (
      <ColorSwatch key={name} name={name} color={color} />
    ))}
  </div>
);

export const Typography = () => (
  <div>
    <h1>Typography</h1>
    <div style={{ fontFamily: designTokens.typography.primaryFont }}>
      <p style={{ fontWeight: designTokens.typography.headings.fontWeight }}>
        Heading Font (Bold)
      </p>
      <p style={{ fontWeight: designTokens.typography.body.fontWeight }}>
        Body Font (Regular)
      </p>
    </div>
  </div>
);
