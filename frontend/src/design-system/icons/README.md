# 🎨 BTS Design System - Ícones

Este módulo fornece todos os ícones do BTS Design System, incluindo o mapeamento de ícones Material Icons (usados anteriormente) para FontAwesome.

## 📦 Instalação

Os ícones já vêm incluídos no pacote `@bts-global/design-system`. Não é necessário instalar nada adicional.

## 🚀 Uso Básico

### Importar o Mapeamento

```javascript
import { ICON_MAPPING, getIcon } from '@bts-global/design-system/icons';

// Obter configuração de um ícone
const homeIcon = getIcon('home');
// { fa: 'house', prefix: 'far' }

// Usar com BtsIcon
const iconConfig = getIcon('home');
// <BtsIcon :name="iconConfig.fa" :prefix="iconConfig.prefix" />
```

### Usar com Componentes

```vue
<template>
  <!-- Usando BtsIcon diretamente -->
  <BtsIcon name="house" prefix="far" />
  
  <!-- Usando o mapeamento -->
  <BtsIcon v-bind="getIconProps('home')" />
  
  <!-- Status Icons -->
  <BtsStatusIcon variant="success" />
  <BtsStatusIcon variant="warning" />
  <BtsStatusIcon variant="danger" />
  <BtsStatusIcon variant="info" />
</template>

<script setup>
import { BtsIcon, BtsStatusIcon } from '@bts-global/design-system';
import { getIcon } from '@bts-global/design-system/icons';

function getIconProps(materialIconName) {
  const config = getIcon(materialIconName);
  if (config.component === 'BtsStatusIcon') {
    return null; // Use BtsStatusIcon component instead
  }
  return { name: config.fa, prefix: config.prefix };
}
</script>
```

## 📋 Mapeamento Completo

### Quando usar BtsStatusIcon

Use o componente `<BtsStatusIcon>` para feedback visual de status:

| Material Icon | BtsStatusIcon Type |
|---------------|-------------------|
| `check_circle` | `success` |
| `warning` | `warning` |
| `error` | `error` |
| `info` | `info` |

### Ícones Mais Usados

| Material Icon | FontAwesome | Uso |
|---------------|-------------|-----|
| `home` | `house` | Página inicial |
| `dashboard` | `chart-line` | Dashboard |
| `people` | `users` | Usuários/Clientes |
| `business` | `building` | Empresas/Estruturas |
| `description` | `file-lines` | Documentos |
| `edit` | `pen` | Editar |
| `delete` | `trash` | Deletar |
| `add` | `plus` | Adicionar |
| `search` | `magnifying-glass` | Buscar |
| `settings` | `gear` | Configurações |

## 🔧 Funções Helper

### `getIcon(materialIconName)`

Retorna a configuração do ícone FontAwesome correspondente.

```javascript
const icon = getIcon('home');
// { fa: 'house', prefix: 'far' }
```

### `isStatusIcon(materialIconName)`

Verifica se um ícone deve usar o componente BtsStatusIcon.

```javascript
isStatusIcon('check_circle'); // true
isStatusIcon('home'); // false
```

### `getUniqueIcons()`

Lista todos os ícones FontAwesome únicos usados no mapeamento.

```javascript
const icons = getUniqueIcons();
// ['far-house', 'far-chart-line', 'far-users', ...]
```

## 📊 Categorias de Ícones

- **Navegação e Interface** (15 ícones)
- **Usuários e Pessoas** (10 ícones)
- **Negócios e Estruturas** (6 ícones)
- **Documentos e Arquivos** (12 ícones)
- **Ações e Operações** (18 ícones)
- **Status e Feedback** (8 ícones)
- **Segurança e Acesso** (5 ícones)
- **Comunicação** (5 ícones)
- **Mídia e Conteúdo** (5 ícones)
- **Formatação de Texto** (5 ícones)
- **Propostas e Contratos** (3 ícones)
- **Outros** (5 ícones)

**Total: 97 ícones únicos**

## 🎯 Migração de Material Icons

Se você está migrando de Material Icons para FontAwesome:

```vue
<!-- ANTES (Material Icons) -->
<q-icon name="home" />
<q-icon name="people" />
<q-icon name="check_circle" color="positive" />

<!-- DEPOIS (BTS Design System) -->
<BtsIcon name="house" prefix="far" />
<BtsIcon name="users" prefix="far" />
<BtsStatusIcon type="success" />
```

## 💡 Dicas

1. **Use `far` (regular) como padrão** para manter consistência
2. **Use `BtsStatusIcon`** para feedback de status (sucesso, erro, aviso, info)
3. **Prefira ícones simples** - evite ícones muito elaborados
4. **Mantenha consistência** - use os mesmos ícones para ações similares

## 📚 Documentação Completa

Para ver todos os ícones disponíveis, consulte o arquivo `iconMapping.js`.

