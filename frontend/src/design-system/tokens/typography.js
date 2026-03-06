/**
 * Design Tokens - Typography
 * BTS Global Corp Design System
 *
 * Tipografia: Inter
 * Características: Clean, legível, modular
 * Princípios: Clara, direta e elegante
 *
 * A fonte Inter transmite modernidade e sofisticação,
 * alinhada com os valores da marca BTS.
 */

export const typography = {
  // ============================================
  // FONT FAMILIES
  // ============================================

  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    secondary: '"Inter", sans-serif',
    mono: '"Fira Code", "Courier New", Courier, monospace',
  },

  // ============================================
  // FONT SIZES
  // ============================================

  fontSize: {
    // Base sizes
    xs: '0.75rem',      // 12px - Caption
    sm: '0.875rem',     // 14px - Body Small
    base: '1rem',       // 16px - Body Default (Regular)
    lg: '1.25rem',      // 20px - Subtitle (Medium)
    xl: '1.5rem',       // 24px - Heading 4 (Medium)
    '2xl': '1.75rem',   // 28px - Heading 3 (SemiBold)
    '3xl': '2rem',      // 32px - Heading 2 (Bold)
    '4xl': '2.5rem',    // 40px - Heading 1 (Bold)
    '5xl': '3rem',      // 48px - Display LG (Bold)
    '6xl': '3.5rem',    // 56px - Display XL (Bold)

    // Specific typography sizes
    caption: '0.75rem',    // 12px - Caption (Regular)
    bodySm: '0.875rem',    // 14px - Body Small (Regular)
  },
  
  // ============================================
  // FONT WEIGHTS
  // ============================================
  
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  // ============================================
  // LINE HEIGHTS
  // ============================================
  
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // ============================================
  // LETTER SPACING
  // ============================================
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // ============================================
  // TEXT STYLES - Estilos Pré-definidos BTS
  // ============================================

  styles: {
    // Display styles
    displayXL: {
      fontSize: '3.5rem',     // 56px
      fontWeight: 700,        // Bold
      lineHeight: '64px',
      letterSpacing: '0',
    },

    displayLG: {
      fontSize: '3rem',       // 48px
      fontWeight: 700,        // Bold
      lineHeight: '56px',
      letterSpacing: '0',
    },

    // Headings
    heading1: {
      fontSize: '2.5rem',     // 40px
      fontWeight: 700,        // Bold
      lineHeight: '48px',
      letterSpacing: '0',
    },

    heading2: {
      fontSize: '2rem',       // 32px
      fontWeight: 700,        // Bold
      lineHeight: '40px',
      letterSpacing: '0',
    },

    heading3: {
      fontSize: '1.75rem',    // 28px
      fontWeight: 600,        // SemiBold
      lineHeight: '36px',
      letterSpacing: '0',
    },

    heading4: {
      fontSize: '1.5rem',     // 24px
      fontWeight: 500,        // Medium
      lineHeight: '32px',
      letterSpacing: '0',
    },

    // Subtitle
    subtitle: {
      fontSize: '1.25rem',    // 20px
      fontWeight: 500,        // Medium
      lineHeight: '28px',
      letterSpacing: '0',
    },

    // Body text
    body: {
      fontSize: '1rem',       // 16px
      fontWeight: 400,        // Regular
      lineHeight: '24px',
      letterSpacing: '0',
    },

    bodySm: {
      fontSize: '0.875rem',   // 14px
      fontWeight: 400,        // Regular
      lineHeight: '20px',
      letterSpacing: '0',
    },

    // Caption
    caption: {
      fontSize: '0.75rem',    // 12px
      fontWeight: 400,        // Regular
      lineHeight: '16px',
      letterSpacing: '0',
    },

    // Button
    button: {
      fontSize: '1rem',       // 16px
      fontWeight: 500,        // Medium
      lineHeight: '24px',
      letterSpacing: '0',
    },

    buttonSm: {
      fontSize: '0.875rem',   // 14px
      fontWeight: 600,        // SemiBold
      lineHeight: '20px',
      letterSpacing: '0',
    },
  },

  // ============================================
  // TYPOGRAPHY COMBINATIONS - Hierarquia Visual
  // ============================================

  combinations: {
    // Combination 1: Thin + Light + Regular + Medium + Bold + Xbold + Black
    emphasis2Steps: {
      description: 'When you need to emphasize a word in a sentence, use the style that is 2 steps heavier to serve as bold.',
      note: 'It\'s important to maintain these pairings, as it reinforces clarity, consistency, and a strong hierarchy in all communications.',
      examples: [
        { base: 'Thin', emphasis: 'Regular' },
        { base: 'Light', emphasis: 'Medium' },
        { base: 'Regular', emphasis: 'Bold' },
        { base: 'Medium', emphasis: 'Xbold' },
        { base: 'Bold', emphasis: 'Black' },
      ],
    },
  },
};

export default typography;

