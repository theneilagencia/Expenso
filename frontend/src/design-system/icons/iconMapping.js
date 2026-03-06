/**
 * Icon Mapping - Material Icons to FontAwesome
 * 
 * Este arquivo mapeia os ícones Material Icons (usados anteriormente)
 * para os ícones FontAwesome do BTS Design System.
 * 
 * Uso:
 * - Para ícones normais: { fa: 'icon-name', prefix: 'far' }
 * - Para status icons: { component: 'BtsStatusIcon', type: 'success|warning|error|info' }
 */

export const ICON_MAPPING = {
  // ============================================
  // 1. NAVEGAÇÃO E INTERFACE (15 ícones)
  // ============================================
  'home': { fa: 'house', prefix: 'far' },
  'dashboard': { fa: 'chart-line', prefix: 'far' },
  'timeline': { fa: 'timeline', prefix: 'far' },
  'folder': { fa: 'folder', prefix: 'far' },
  'folder_special': { fa: 'folder-open', prefix: 'far' },
  'download': { fa: 'download', prefix: 'far' },
  'help': { fa: 'circle-question', prefix: 'far' },
  'settings': { fa: 'gear', prefix: 'far' },
  'search': { fa: 'magnifying-glass', prefix: 'far' },
  'menu': { fa: 'bars', prefix: 'far' },
  'arrow_back': { fa: 'arrow-left', prefix: 'far' },
  'arrow_forward': { fa: 'arrow-right', prefix: 'far' },
  'arrow_upward': { fa: 'arrow-up', prefix: 'far' },
  'arrow_downward': { fa: 'arrow-down', prefix: 'far' },
  'expand_more': { fa: 'chevron-down', prefix: 'far' },

  // ============================================
  // 2. USUÁRIOS E PESSOAS (10 ícones)
  // ============================================
  'person': { fa: 'user', prefix: 'far' },
  'people': { fa: 'users', prefix: 'far' },
  'person_add': { fa: 'user-plus', prefix: 'far' },
  'person_outline': { fa: 'user', prefix: 'far' },
  'people_outline': { fa: 'users', prefix: 'far' },
  'person_search': { fa: 'magnifying-glass', prefix: 'far' },
  'account_circle': { fa: 'circle-user', prefix: 'far' },
  'support_agent': { fa: 'headset', prefix: 'far' },
  'support': { fa: 'circle-question', prefix: 'far' },
  'handshake': { fa: 'handshake', prefix: 'far' },

  // ============================================
  // 3. NEGÓCIOS E ESTRUTURAS (6 ícones)
  // ============================================
  'business': { fa: 'building', prefix: 'far' },
  'business_center': { fa: 'briefcase', prefix: 'far' },
  'gavel': { fa: 'gavel', prefix: 'far' },
  'account_balance': { fa: 'landmark', prefix: 'far' },
  'bar_chart': { fa: 'chart-column', prefix: 'far' },
  'pie_chart': { fa: 'chart-pie', prefix: 'far' },

  // ============================================
  // 4. DOCUMENTOS E ARQUIVOS (12 ícones)
  // ============================================
  'description': { fa: 'file-lines', prefix: 'far' },
  'assignment': { fa: 'clipboard-list', prefix: 'far' },
  'attach_file': { fa: 'paperclip', prefix: 'far' },
  'cloud_upload': { fa: 'cloud-arrow-up', prefix: 'far' },
  'upload': { fa: 'cloud-arrow-up', prefix: 'far' },
  'upload_file': { fa: 'file-arrow-up', prefix: 'far' },
  'inbox': { fa: 'inbox', prefix: 'far' },
  'archive': { fa: 'box-archive', prefix: 'far' },
  'unarchive': { fa: 'box-open', prefix: 'far' },
  'category': { fa: 'tag', prefix: 'far' },
  'list': { fa: 'list', prefix: 'far' },
  'mark_email_read': { fa: 'envelope-open', prefix: 'far' },

  // ============================================
  // 5. AÇÕES E OPERAÇÕES (18 ícones)
  // ============================================
  'add': { fa: 'plus', prefix: 'far' },
  'add_circle_outline': { fa: 'circle-plus', prefix: 'far' },
  'edit': { fa: 'pen', prefix: 'far' },
  'delete': { fa: 'trash', prefix: 'far' },
  'save': { fa: 'floppy-disk', prefix: 'far' },
  'refresh': { fa: 'rotate', prefix: 'far' },
  'close': { fa: 'xmark', prefix: 'far' },
  'clear_all': { fa: 'trash-can', prefix: 'far' },
  'check': { fa: 'check', prefix: 'far' },
  'check_circle': { component: 'BtsStatusIcon', type: 'success' },
  'verified': { fa: 'circle-check', prefix: 'fas' },
  'fact_check': { fa: 'clipboard-check', prefix: 'far' },
  'send': { fa: 'paper-plane', prefix: 'far' },
  'visibility': { fa: 'eye', prefix: 'far' },
  'visibility_off': { fa: 'eye-slash', prefix: 'far' },
  'link': { fa: 'link', prefix: 'far' },
  'swap_horiz': { fa: 'right-left', prefix: 'far' },
  'sync_alt': { fa: 'rotate', prefix: 'far' },

  // ============================================
  // 6. STATUS E FEEDBACK (8 ícones)
  // ============================================
  'warning': { component: 'BtsStatusIcon', type: 'warning' },
  'error': { component: 'BtsStatusIcon', type: 'error' },
  'info': { component: 'BtsStatusIcon', type: 'info' },
  'schedule': { fa: 'clock', prefix: 'far' },
  'event': { fa: 'calendar', prefix: 'far' },
  'notifications': { fa: 'bell', prefix: 'far' },
  'lightbulb': { fa: 'lightbulb', prefix: 'far' },

  // ============================================
  // 7. SEGURANÇA E ACESSO (5 ícones)
  // ============================================
  'lock': { fa: 'lock', prefix: 'far' },
  'lock_open': { fa: 'lock-open', prefix: 'far' },
  'block': { fa: 'ban', prefix: 'far' },
  'logout': { fa: 'arrow-right-from-bracket', prefix: 'far' },
  'public': { fa: 'globe', prefix: 'far' },

  // ============================================
  // 8. COMUNICAÇÃO (5 ícones)
  // ============================================
  'email': { fa: 'envelope', prefix: 'far' },
  'phone': { fa: 'phone', prefix: 'far' },
  'contact_support': { fa: 'headset', prefix: 'far' },
  'quiz': { fa: 'circle-question', prefix: 'far' },
  'language': { fa: 'language', prefix: 'far' },

  // ============================================
  // 9. MÍDIA E CONTEÚDO (5 ícones)
  // ============================================
  'play_arrow': { fa: 'play', prefix: 'far' },
  'play_circle': { fa: 'circle-play', prefix: 'far' },
  'school': { fa: 'graduation-cap', prefix: 'far' },
  'translate': { fa: 'language', prefix: 'far' },
  'open_in_new': { fa: 'arrow-up-right-from-square', prefix: 'far' },

  // ============================================
  // 10. FORMATAÇÃO DE TEXTO (5 ícones)
  // ============================================
  'format_bold': { fa: 'bold', prefix: 'far' },
  'format_italic': { fa: 'italic', prefix: 'far' },
  'format_list_bulleted': { fa: 'list-ul', prefix: 'far' },
  'format_list_numbered': { fa: 'list-ol', prefix: 'far' },
  'title': { fa: 'heading', prefix: 'far' },

  // ============================================
  // 11. PROPOSTAS E CONTRATOS (3 ícones)
  // ============================================
  'request_quote': { fa: 'file-contract', prefix: 'far' },
  'draw': { fa: 'pen-to-square', prefix: 'far' },
  'local_shipping': { fa: 'truck', prefix: 'far' },

  // ============================================
  // 12. OUTROS (5 ícones)
  // ============================================
  'tune': { fa: 'filter', prefix: 'far' },
  'percent': { fa: 'percent', prefix: 'far' },
  'cloud_off': { fa: 'cloud-slash', prefix: 'far' },
  'trending_up': { fa: 'arrow-trend-up', prefix: 'far' },
  'trending_down': { fa: 'arrow-trend-down', prefix: 'far' },
};

/**
 * Helper function para obter o ícone mapeado
 *
 * @param {string} materialIconName - Nome do ícone Material
 * @returns {object|null} Configuração do ícone FontAwesome ou null se não encontrado
 *
 * @example
 * const icon = getIcon('home');
 * // { fa: 'house', prefix: 'far' }
 *
 * const statusIcon = getIcon('check_circle');
 * // { component: 'BtsStatusIcon', type: 'success' }
 */
export function getIcon(materialIconName) {
  return ICON_MAPPING[materialIconName] || null;
}

/**
 * Verifica se um ícone deve usar BtsStatusIcon
 *
 * @param {string} materialIconName - Nome do ícone Material
 * @returns {boolean}
 */
export function isStatusIcon(materialIconName) {
  const icon = getIcon(materialIconName);
  return icon?.component === 'BtsStatusIcon';
}

/**
 * Lista todos os ícones FontAwesome únicos usados no mapeamento
 * (útil para importação seletiva)
 */
export function getUniqueIcons() {
  const icons = new Set();

  Object.values(ICON_MAPPING).forEach(config => {
    if (config.fa) {
      icons.add(`${config.prefix}-${config.fa}`);
    }
  });

  return Array.from(icons).sort();
}

