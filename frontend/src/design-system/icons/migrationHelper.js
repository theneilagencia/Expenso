/**
 * Migration Helper - Utilitários para migração de ícones
 * 
 * Este arquivo contém funções helper para facilitar a migração
 * de Material Icons para FontAwesome.
 */

import { ICON_MAPPING, getIcon, isStatusIcon } from './iconMapping.js';

/**
 * Converte um nome de ícone Material para props do BtsIcon
 * 
 * @param {string} materialIconName - Nome do ícone Material
 * @returns {object|null} Props para BtsIcon ou null se for StatusIcon
 * 
 * @example
 * const props = getMaterialIconProps('home');
 * // { name: 'house', prefix: 'far' }
 * 
 * // Usar no template:
 * <BtsIcon v-bind="getMaterialIconProps('home')" />
 */
export function getMaterialIconProps(materialIconName) {
  const config = getIcon(materialIconName);
  
  if (!config) {
    console.warn(`[BTS Icons] Icon not found in mapping: ${materialIconName}`);
    return null;
  }
  
  if (config.component === 'BtsStatusIcon') {
    console.warn(`[BTS Icons] "${materialIconName}" should use BtsStatusIcon with type="${config.type}"`);
    return null;
  }
  
  return {
    name: config.fa,
    prefix: config.prefix,
  };
}

/**
 * Converte um nome de ícone Material para props do BtsStatusIcon
 * 
 * @param {string} materialIconName - Nome do ícone Material
 * @returns {object|null} Props para BtsStatusIcon ou null se não for StatusIcon
 * 
 * @example
 * const props = getStatusIconProps('check_circle');
 * // { type: 'success' }
 * 
 * // Usar no template:
 * <BtsStatusIcon v-bind="getStatusIconProps('check_circle')" />
 */
export function getStatusIconProps(materialIconName) {
  const config = getIcon(materialIconName);
  
  if (!config) {
    console.warn(`[BTS Icons] Icon not found in mapping: ${materialIconName}`);
    return null;
  }
  
  if (config.component !== 'BtsStatusIcon') {
    console.warn(`[BTS Icons] "${materialIconName}" is not a status icon`);
    return null;
  }
  
  return {
    type: config.type,
  };
}

/**
 * Gera código Vue para substituir um ícone Material
 * 
 * @param {string} materialIconName - Nome do ícone Material
 * @param {object} options - Opções adicionais (size, color, etc)
 * @returns {string} Código Vue do componente
 * 
 * @example
 * generateIconCode('home', { size: 'sm', color: '#18365b' });
 * // '<BtsIcon name="house" prefix="far" size="sm" color="#18365b" />'
 */
export function generateIconCode(materialIconName, options = {}) {
  const config = getIcon(materialIconName);
  
  if (!config) {
    return `<!-- Icon not found: ${materialIconName} -->`;
  }
  
  if (config.component === 'BtsStatusIcon') {
    const { shape = 'circle' } = options;
    return `<BtsStatusIcon type="${config.type}" shape="${shape}" />`;
  }
  
  const { size = 'default', color = '#555555' } = options;
  const attrs = [
    `name="${config.fa}"`,
    `prefix="${config.prefix}"`,
  ];
  
  if (size !== 'default') {
    attrs.push(`size="${size}"`);
  }
  
  if (color !== '#555555') {
    attrs.push(`color="${color}"`);
  }
  
  return `<BtsIcon ${attrs.join(' ')} />`;
}

/**
 * Gera relatório de migração para um array de ícones
 * 
 * @param {string[]} materialIconNames - Array de nomes de ícones Material
 * @returns {object} Relatório de migração
 * 
 * @example
 * const report = generateMigrationReport(['home', 'people', 'check_circle']);
 * console.log(report);
 */
export function generateMigrationReport(materialIconNames) {
  const report = {
    total: materialIconNames.length,
    found: 0,
    notFound: 0,
    statusIcons: 0,
    regularIcons: 0,
    icons: [],
    missing: [],
  };
  
  materialIconNames.forEach(name => {
    const config = getIcon(name);
    
    if (!config) {
      report.notFound++;
      report.missing.push(name);
      return;
    }
    
    report.found++;
    
    if (config.component === 'BtsStatusIcon') {
      report.statusIcons++;
      report.icons.push({
        material: name,
        component: 'BtsStatusIcon',
        type: config.type,
      });
    } else {
      report.regularIcons++;
      report.icons.push({
        material: name,
        component: 'BtsIcon',
        fa: config.fa,
        prefix: config.prefix,
      });
    }
  });
  
  return report;
}

/**
 * Extrai todos os nomes de ícones Material de um código Vue
 * (útil para análise de componentes)
 * 
 * @param {string} vueCode - Código Vue
 * @returns {string[]} Array de nomes de ícones encontrados
 */
export function extractMaterialIcons(vueCode) {
  const icons = new Set();
  
  // Padrões de busca
  const patterns = [
    /name="([^"]+)"/g,           // q-icon name="..."
    /icon="([^"]+)"/g,           // q-btn icon="..."
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(vueCode)) !== null) {
      icons.add(match[1]);
    }
  });
  
  return Array.from(icons);
}

/**
 * Composable Vue para usar ícones migrados
 * 
 * @example
 * // No componente Vue
 * import { useMigratedIcons } from '@bts-global/design-system/icons/migrationHelper';
 * 
 * const { getIconProps, getStatusProps } = useMigratedIcons();
 * 
 * // No template
 * <BtsIcon v-bind="getIconProps('home')" />
 * <BtsStatusIcon v-bind="getStatusProps('check_circle')" />
 */
export function useMigratedIcons() {
  return {
    getIconProps: getMaterialIconProps,
    getStatusProps: getStatusIconProps,
    isStatus: isStatusIcon,
    getIcon,
  };
}

