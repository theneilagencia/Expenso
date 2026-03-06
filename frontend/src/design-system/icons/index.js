/**
 * BTS Design System - Icons Module
 * 
 * Este módulo exporta:
 * - Mapeamento de ícones Material → FontAwesome
 * - Funções helper para trabalhar com ícones
 * - Registro automático dos ícones FontAwesome
 * 
 * @example
 * // Importar o mapeamento
 * import { ICON_MAPPING, getIcon } from '@bts-global/design-system/icons';
 * 
 * // Obter configuração de um ícone
 * const homeIcon = getIcon('home');
 * // { fa: 'house', prefix: 'far' }
 * 
 * // Verificar se é um status icon
 * import { isStatusIcon } from '@bts-global/design-system/icons';
 * isStatusIcon('check_circle'); // true
 */

// Importar e auto-registrar os ícones FontAwesome
import './fontawesome.js';

// Exportar mapeamento e helpers
export {
  ICON_MAPPING,
  getIcon,
  isStatusIcon,
  getUniqueIcons,
} from './iconMapping.js';

// Exportar migration helpers
export {
  getMaterialIconProps,
  getStatusIconProps,
  generateIconCode,
  generateMigrationReport,
  extractMaterialIcons,
  useMigratedIcons,
} from './migrationHelper.js';

// Exportar composables
export {
  useIcon,
  useIcons,
  useConditionalIcon,
  useActionIcons,
  useNavigationIcons,
  useStatusIcons,
} from './composables.js';

// Re-exportar função de registro (caso precise registrar manualmente)
export { registerIcons } from './fontawesome.js';

