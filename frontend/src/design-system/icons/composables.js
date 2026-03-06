/**
 * Vue Composables para trabalhar com ícones
 * 
 * Facilita o uso de ícones em componentes Vue
 */

import { computed } from 'vue';
import { getIcon, isStatusIcon } from './iconMapping.js';

/**
 * Composable para usar ícones do BTS Design System
 * 
 * @example
 * // No componente Vue
 * import { useIcon } from '@bts-global/design-system/icons/composables';
 * 
 * const homeIcon = useIcon('home');
 * // { name: 'house', prefix: 'far', isStatus: false }
 * 
 * // No template
 * <BtsIcon v-bind="homeIcon" />
 */
export function useIcon(materialIconName) {
  const config = computed(() => getIcon(materialIconName));
  const isStatus = computed(() => isStatusIcon(materialIconName));
  
  const iconProps = computed(() => {
    if (!config.value) return null;
    if (isStatus.value) return null;
    
    return {
      name: config.value.fa,
      prefix: config.value.prefix,
    };
  });
  
  const statusProps = computed(() => {
    if (!config.value) return null;
    if (!isStatus.value) return null;
    
    return {
      type: config.value.type,
    };
  });
  
  return {
    ...iconProps.value,
    isStatus: isStatus.value,
    iconProps: iconProps.value,
    statusProps: statusProps.value,
  };
}

/**
 * Composable para gerenciar múltiplos ícones
 * 
 * @param {object} icons - Objeto com nomes de ícones Material
 * @returns {object} Objeto com props de ícones
 * 
 * @example
 * const icons = useIcons({
 *   home: 'home',
 *   users: 'people',
 *   success: 'check_circle'
 * });
 * 
 * // No template
 * <BtsIcon v-bind="icons.home" />
 * <BtsIcon v-bind="icons.users" />
 * <BtsStatusIcon v-bind="icons.success" />
 */
export function useIcons(icons) {
  const result = {};
  
  Object.keys(icons).forEach(key => {
    const materialIconName = icons[key];
    const config = getIcon(materialIconName);
    
    if (!config) {
      result[key] = null;
      return;
    }
    
    if (config.component === 'BtsStatusIcon') {
      result[key] = { type: config.type };
    } else {
      result[key] = { name: config.fa, prefix: config.prefix };
    }
  });
  
  return result;
}

/**
 * Composable para ícones condicionais
 * 
 * @param {function} condition - Função que retorna true/false
 * @param {string} trueIcon - Ícone quando true
 * @param {string} falseIcon - Ícone quando false
 * 
 * @example
 * const statusIcon = useConditionalIcon(
 *   () => isActive.value,
 *   'check_circle',
 *   'error'
 * );
 * 
 * // No template
 * <BtsStatusIcon v-bind="statusIcon" />
 */
export function useConditionalIcon(condition, trueIcon, falseIcon) {
  return computed(() => {
    const iconName = condition() ? trueIcon : falseIcon;
    const config = getIcon(iconName);
    
    if (!config) return null;
    
    if (config.component === 'BtsStatusIcon') {
      return { type: config.type };
    }
    
    return { name: config.fa, prefix: config.prefix };
  });
}

/**
 * Composable para ícones de ação (edit, delete, view, etc)
 * 
 * @returns {object} Objeto com ícones de ação comuns
 * 
 * @example
 * const actions = useActionIcons();
 * 
 * // No template
 * <BtsIconButton v-bind="actions.edit" @click="handleEdit" />
 * <BtsIconButton v-bind="actions.delete" @click="handleDelete" />
 */
export function useActionIcons() {
  return {
    add: { icon: 'plus', prefix: 'far' },
    edit: { icon: 'pen', prefix: 'far' },
    delete: { icon: 'trash', prefix: 'far' },
    save: { icon: 'floppy-disk', prefix: 'far' },
    cancel: { icon: 'xmark', prefix: 'far' },
    view: { icon: 'eye', prefix: 'far' },
    download: { icon: 'download', prefix: 'far' },
    upload: { icon: 'cloud-arrow-up', prefix: 'far' },
    search: { icon: 'magnifying-glass', prefix: 'far' },
    filter: { icon: 'filter', prefix: 'far' },
    refresh: { icon: 'rotate', prefix: 'far' },
    settings: { icon: 'gear', prefix: 'far' },
  };
}

/**
 * Composable para ícones de navegação
 * 
 * @returns {object} Objeto com ícones de navegação comuns
 * 
 * @example
 * const nav = useNavigationIcons();
 * 
 * // No template
 * <BtsIcon v-bind="nav.home" />
 * <BtsIcon v-bind="nav.dashboard" />
 */
export function useNavigationIcons() {
  return {
    home: { name: 'house', prefix: 'far' },
    dashboard: { name: 'chart-line', prefix: 'far' },
    users: { name: 'users', prefix: 'far' },
    business: { name: 'building', prefix: 'far' },
    documents: { name: 'file-lines', prefix: 'far' },
    settings: { name: 'gear', prefix: 'far' },
    help: { name: 'circle-question', prefix: 'far' },
    notifications: { name: 'bell', prefix: 'far' },
    profile: { name: 'circle-user', prefix: 'far' },
    logout: { name: 'arrow-right-from-bracket', prefix: 'far' },
  };
}

/**
 * Composable para ícones de status
 * 
 * @returns {object} Objeto com ícones de status
 * 
 * @example
 * const status = useStatusIcons();
 * 
 * // No template
 * <BtsStatusIcon v-bind="status.success" />
 * <BtsStatusIcon v-bind="status.error" />
 */
export function useStatusIcons() {
  return {
    success: { type: 'success' },
    warning: { type: 'warning' },
    error: { type: 'error' },
    info: { type: 'info' },
  };
}

