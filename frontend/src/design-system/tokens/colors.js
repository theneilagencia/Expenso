/**
 * Design Tokens - Colors
 * BTS Global Corp Design System
 *
 * Princípios visuais: Sofisticado, moderno, confiável
 * Paleta sóbria (azul escuro, branco, preto, toques de azul-claro)
 *
 * Estrutura:
 * 1. Primary Brand Colors (Cores principais da marca)
 * 2. Secondary Colors (Cores secundárias)
 * 3. Extended Palette (Escalas expandidas)
 * 4. Semantic Colors (Cores com significado)
 */

export const colors = {
  // ============================================
  // PRIMARY BRAND COLORS
  // ============================================

  primary: {
    // White C0
    white: '#FFFFFF',           // C0 M0 Y0 K0 | R255 G255 B255

    // Black P02
    black: '#000000',           // C0 M0 Y0 K100 | R0 G0 B0

    // Blue D03
    blue: '#1B3857',            // C88 M65 Y0 K78 | R18 G37 E87

    // Blue Highlight
    blueHighlight: '#1B5AB4',   // C87 M50 Y0 K29 | R27 G90 B180
  },

  // ============================================
  // SECONDARY BRAND COLORS
  // ============================================

  secondary: {
    // Blue C01
    blueC01: '#1B3857',         // C74 M61 Y0 K64 | R46 G54 B91

    // Blue C02
    blueC02: '#1B4668',         // C100 M33 Y0 K42 | R0 G99 B147

    // Blue 503
    blue503: '#0C80A5',         // C100 M34 Y0 K35 | R0 G108 B165

    // Blue C04
    blueC04: '#2A7BA1',         // C78 M25 Y0 K37 | R46 G123 B161

    // Blue 505
    blue505: '#63C9F3',         // C61 M26 Y0 K5 | R68 G181 B243

    // Gray 506
    gray506: '#B2B2B2',         // C0 M0 Y0 K9 | R232 G232 B232
  },

  // ============================================
  // NEUTRAL COLORS
  // ============================================

  neutral: {
    // White C0
    white: '#FFFFFF',           // C0 M0 Y0 K0 | R255 G255 B255

    // Gray Light
    grayLight: '#E4E4E4',       // C3 M4 Y0 K5 | R229 G229 B244

    // Gray Semi-Light
    graySemiLight: '#C9C9C9',   // C12 M8 Y9 K10 | R229 G229 B229

    // Gray Base
    grayBase: '#C6C6C6',        // C0 M0 Y0 K25 | R198 G198 B198

    // Gray Semi-Dark
    graySemiDark: '#9B9B9B',    // C42 M33 Y33 K10 | R149 G149 B149

    // Gray Dark
    grayDark: '#595757',        // C60 M50 Y48 K42 | R87 G87 B87

    // Black
    black: '#333333',           // C0 M0 Y0 K90 | R19 G19 B19
  },
  
  // ============================================
  // FEEDBACK COLORS
  // ============================================

  feedback: {
    // Verde (Success)
    success: {
      light: '#B1D2B1',         // C31 M5 Y26 K1 | R177 G210 B177
      semiLight: '#8CC28C',     // C51 M0 Y51 K0 | R140 G194 B140
      base: '#2E8B2E',          // C100 M0 Y100 K0 | R46 G139 B46
      semiDark: '#1A661A',      // C100 M23 Y100 K20 | R26 G102 B26
      dark: '#0D330D',          // C100 M50 Y100 K50 | R13 G51 B13
      darker: '#073307',        // C100 M33 Y100 K80 | R7 G51 B7
    },

    // Amarelo (Warning)
    warning: {
      light: '#FFF4D1',         // C0 M0 Y26 K0 | R255 G244 B209
      semiLight: '#FFE6A4',     // C0 M0 Y51 K0 | R255 G230 B164
      base: '#FFD700',          // C0 M0 Y100 K0 | R255 G215 B0
      semiDark: '#B39600',      // C23 M23 Y100 K20 | R179 G150 B0
      dark: '#665500',          // C50 M50 Y100 K50 | R102 G85 B0
      darker: '#332B00',        // C33 M33 Y100 K80 | R51 G43 B0
    },

    // Vermelho (Error)
    error: {
      light: '#F9B6B6',         // C0 M33 Y26 K1 | R249 G182 B182
      semiLight: '#F48C8C',     // C0 M51 Y51 K0 | R244 G140 B140
      base: '#E63939',          // C0 M100 Y100 K0 | R230 G57 B57
      semiDark: '#A32929',      // C23 M100 Y100 K20 | R163 G41 B41
      dark: '#5C1717',          // C50 M100 Y100 K50 | R92 G23 B23
      darker: '#2E0C0C',        // C33 M100 Y100 K80 | R46 G12 B12
    },

    // Info (usando azuis da marca)
    info: {
      light: '#63C9F3',         // Blue 505
      semiLight: '#2A7BA1',     // Blue C04
      base: '#0C80A5',          // Blue 503
      semiDark: '#1B4668',      // Blue C02
      dark: '#1B3857',          // Blue D03
      darker: '#1B3857',        // Blue C01
    },
  },

  // ============================================
  // TEXT COLORS
  // ============================================

  text: {
    primary: '#000000',                 // Black P02
    secondary: '#333333',               // Neutral Black
    tertiary: '#595757',                // Gray Dark
    disabled: '#9B9B9B',                // Gray Semi-Dark
    inverse: '#FFFFFF',                 // White
    link: '#1B5AB4',                    // Blue Highlight
    linkHover: '#1B3857',               // Blue D03
  },

  // ============================================
  // BACKGROUND COLORS
  // ============================================

  background: {
    default: '#FFFFFF',                 // White
    paper: '#E4E4E4',                   // Gray Light
    elevated: '#FFFFFF',                // White
    dark: '#1B3857',                    // Blue D03
    light: '#C9C9C9',                   // Gray Semi-Light
    accent: '#63C9F3',                  // Blue 505
  },

  // ============================================
  // BORDER COLORS
  // ============================================

  border: {
    default: '#C6C6C6',                 // Gray Base
    light: '#E4E4E4',                   // Gray Light
    dark: '#9B9B9B',                    // Gray Semi-Dark
    focus: '#1B5AB4',                   // Blue Highlight
    divider: '#B2B2B2',                 // Gray 506
  },

};

export default colors;

