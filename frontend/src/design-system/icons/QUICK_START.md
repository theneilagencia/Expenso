# 🚀 Quick Start - BTS Icons

Guia rápido para começar a usar os ícones do BTS Design System.

## ⚡ Setup em 3 Passos

### 1️⃣ Instalar

```bash
npm install @bts-global/design-system
```

### 2️⃣ Configurar (main.js)

```javascript
import { createApp } from 'vue';
import App from './App.vue';

// Importar componentes
import { BtsIcon, BtsStatusIcon } from '@bts-global/design-system';

// Importar estilos
import '@bts-global/design-system/style.css';

// Importar ícones (IMPORTANTE!)
import '@bts-global/design-system/icons';

const app = createApp(App);

// Registrar globalmente (opcional)
app.component('BtsIcon', BtsIcon);
app.component('BtsStatusIcon', BtsStatusIcon);

app.mount('#app');
```

### 3️⃣ Usar

```vue
<template>
  <BtsIcon name="house" prefix="far" />
  <BtsStatusIcon variant="success" />
</template>
```

---

## 📖 Exemplos Rápidos

### Ícones Básicos

```vue
<BtsIcon name="house" prefix="far" />
<BtsIcon name="users" prefix="far" />
<BtsIcon name="building" prefix="far" />
<BtsIcon name="gear" prefix="far" />
```

### Ícones de Status

```vue
<BtsStatusIcon variant="success" />
<BtsStatusIcon variant="warning" />
<BtsStatusIcon variant="danger" />
<BtsStatusIcon variant="info" />
```

### Com Tamanhos

```vue
<BtsIcon name="user" prefix="far" size="sm" />    <!-- 16px -->
<BtsIcon name="user" prefix="far" size="default" /> <!-- 24px -->
<BtsIcon name="user" prefix="far" size="lg" />    <!-- 32px -->
```

### Com Cores

```vue
<BtsIcon name="user" prefix="far" color="#18365b" />
<BtsIcon name="user" prefix="far" color="#1B9B45" />
<BtsIcon name="user" prefix="far" color="#DB242A" />
```

---

## 🔄 Migração Rápida

### Substituir Material Icons

| Antes | Depois |
|-------|--------|
| `<q-icon name="home" />` | `<BtsIcon name="house" prefix="far" />` |
| `<q-icon name="people" />` | `<BtsIcon name="users" prefix="far" />` |
| `<q-icon name="edit" />` | `<BtsIcon name="pen" prefix="far" />` |
| `<q-icon name="delete" />` | `<BtsIcon name="trash" prefix="far" />` |
| `<q-icon name="check_circle" color="positive" />` | `<BtsStatusIcon variant="success" />` |

### Usar Helper (Temporário)

```vue
<!-- Durante migração -->
<BtsMigratedIcon material-icon="home" />
<BtsMigratedIcon material-icon="people" />

<!-- Depois refatorar para -->
<BtsIcon name="house" prefix="far" />
<BtsIcon name="users" prefix="far" />
```

---

## 🎯 Ícones Mais Comuns

### Navegação
```vue
<BtsIcon name="house" prefix="far" />          <!-- home -->
<BtsIcon name="chart-line" prefix="far" />     <!-- dashboard -->
<BtsIcon name="gear" prefix="far" />           <!-- settings -->
<BtsIcon name="bars" prefix="far" />           <!-- menu -->
```

### Usuários
```vue
<BtsIcon name="user" prefix="far" />           <!-- person -->
<BtsIcon name="users" prefix="far" />          <!-- people -->
<BtsIcon name="user-plus" prefix="far" />      <!-- add user -->
<BtsIcon name="circle-user" prefix="far" />    <!-- account -->
```

### Ações
```vue
<BtsIcon name="plus" prefix="far" />           <!-- add -->
<BtsIcon name="pen" prefix="far" />            <!-- edit -->
<BtsIcon name="trash" prefix="far" />          <!-- delete -->
<BtsIcon name="floppy-disk" prefix="far" />    <!-- save -->
<BtsIcon name="xmark" prefix="far" />          <!-- close -->
```

### Documentos
```vue
<BtsIcon name="file-lines" prefix="far" />     <!-- document -->
<BtsIcon name="folder" prefix="far" />         <!-- folder -->
<BtsIcon name="download" prefix="far" />       <!-- download -->
<BtsIcon name="cloud-arrow-up" prefix="far" /> <!-- upload -->
```

---

## 💡 Dicas Rápidas

1. **Sempre use `prefix="far"`** (regular) como padrão
2. **Use `BtsStatusIcon`** para feedback (success, warning, error, info)
3. **Prefira ícones simples** - evite ícones muito elaborados
4. **Mantenha consistência** - use os mesmos ícones para ações similares

---

## 🔗 Links Úteis

- **[Mapeamento Completo](./iconMapping.js)** - Todos os 97 ícones
- **[Guia de Migração](./MIGRATION_GUIDE.md)** - Passo a passo detalhado
- **[Exemplos de Uso](./USAGE_EXAMPLES.md)** - Casos práticos
- **[Documentação](./README.md)** - Documentação completa

---

## 🆘 Problemas?

### Ícone não aparece
```javascript
// ✅ Verificar se importou os ícones
import '@bts-global/design-system/icons';

// ✅ Verificar nome e prefix
<BtsIcon name="house" prefix="far" /> // ✅ Correto
<BtsIcon name="home" prefix="far" />  // ❌ Errado (nome Material)
```

### Ícone de status não funciona
```vue
<!-- ❌ Errado -->
<BtsIcon name="check_circle" prefix="far" />

<!-- ✅ Correto -->
<BtsStatusIcon variant="success" />
```

---

## 📊 Referência Rápida

### Material → FontAwesome

| Material | FontAwesome | Uso |
|----------|-------------|-----|
| `home` | `house` | Home |
| `dashboard` | `chart-line` | Dashboard |
| `people` | `users` | Usuários |
| `business` | `building` | Empresas |
| `description` | `file-lines` | Documentos |
| `edit` | `pen` | Editar |
| `delete` | `trash` | Deletar |
| `add` | `plus` | Adicionar |
| `search` | `magnifying-glass` | Buscar |
| `settings` | `gear` | Configurações |

### Status Icons

| Material | BtsStatusIcon |
|----------|---------------|
| `check_circle` | `type="success"` |
| `warning` | `type="warning"` |
| `error` | `type="error"` |
| `info` | `type="info"` |

---

**Pronto para começar! 🎉**

