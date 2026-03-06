# 📖 Exemplos de Uso - BTS Icons

Exemplos práticos de como usar os ícones do BTS Design System.

## 🚀 Setup Inicial

### 1. Instalar o Design System

```bash
npm install @bts-global/design-system
```

### 2. Importar no seu projeto

```javascript
// main.js ou main.ts
import { createApp } from 'vue';
import App from './App.vue';

// Importar componentes
import { BtsIcon, BtsStatusIcon, BtsMigratedIcon } from '@bts-global/design-system';

// Importar estilos
import '@bts-global/design-system/style.css';

// Importar e registrar ícones (IMPORTANTE!)
import '@bts-global/design-system/icons';

const app = createApp(App);

// Registrar componentes globalmente (opcional)
app.component('BtsIcon', BtsIcon);
app.component('BtsStatusIcon', BtsStatusIcon);
app.component('BtsMigratedIcon', BtsMigratedIcon);

app.mount('#app');
```

---

## 💡 Exemplos por Caso de Uso

### 1. Navegação/Sidebar

```vue
<template>
  <nav class="sidebar">
    <ul>
      <li>
        <BtsIcon name="house" prefix="far" />
        <span>Home</span>
      </li>
      <li>
        <BtsIcon name="chart-line" prefix="far" />
        <span>Dashboard</span>
      </li>
      <li>
        <BtsIcon name="users" prefix="far" />
        <span>Clientes</span>
      </li>
      <li>
        <BtsIcon name="building" prefix="far" />
        <span>Estruturas</span>
      </li>
      <li>
        <BtsIcon name="gear" prefix="far" />
        <span>Configurações</span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { BtsIcon } from '@bts-global/design-system';
</script>
```

### 2. Botões de Ação

```vue
<template>
  <div class="actions">
    <!-- Botão com ícone e texto -->
    <BtsButton variant="primary">
      <BtsIcon name="plus" prefix="far" size="sm" color="#ffffff" />
      Adicionar Cliente
    </BtsButton>

    <!-- Botão apenas com ícone -->
    <BtsIconButton icon="pen" variant="secondary" @click="handleEdit" />
    <BtsIconButton icon="trash" variant="secondary" @click="handleDelete" />
    <BtsIconButton icon="download" variant="primary" @click="handleDownload" />
  </div>
</template>

<script setup>
import { BtsButton, BtsIconButton, BtsIcon } from '@bts-global/design-system';

const handleEdit = () => console.log('Edit');
const handleDelete = () => console.log('Delete');
const handleDownload = () => console.log('Download');
</script>
```

### 3. Tabela com Ações

```vue
<template>
  <table class="data-table">
    <thead>
      <tr>
        <th>Nome</th>
        <th>Email</th>
        <th>Status</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>{{ user.name }}</td>
        <td>{{ user.email }}</td>
        <td>
          <BtsStatusIcon :variant="user.active ? 'success' : 'danger'" />
          {{ user.active ? 'Ativo' : 'Inativo' }}
        </td>
        <td class="actions">
          <BtsIconButton 
            icon="eye" 
            variant="secondary" 
            size="sm" 
            @click="viewUser(user)" 
          />
          <BtsIconButton 
            icon="pen" 
            variant="secondary" 
            size="sm" 
            @click="editUser(user)" 
          />
          <BtsIconButton 
            icon="trash" 
            variant="secondary" 
            size="sm" 
            @click="deleteUser(user)" 
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { BtsIconButton, BtsStatusIcon } from '@bts-global/design-system';

const users = ref([
  { id: 1, name: 'João Silva', email: 'joao@example.com', active: true },
  { id: 2, name: 'Maria Santos', email: 'maria@example.com', active: false },
]);

const viewUser = (user) => console.log('View', user);
const editUser = (user) => console.log('Edit', user);
const deleteUser = (user) => console.log('Delete', user);
</script>
```

### 4. Cards de Dashboard

```vue
<template>
  <div class="dashboard-cards">
    <div class="stat-card">
      <div class="stat-card__icon">
        <BtsIcon name="users" prefix="far" size="lg" color="#18365b" />
      </div>
      <div class="stat-card__content">
        <h3>Total de Clientes</h3>
        <p class="stat-card__value">1,234</p>
        <div class="stat-card__trend">
          <BtsIcon name="arrow-trend-up" prefix="far" size="sm" color="#1B9B45" />
          <span>+12% este mês</span>
        </div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-card__icon">
        <BtsIcon name="building" prefix="far" size="lg" color="#18365b" />
      </div>
      <div class="stat-card__content">
        <h3>Estruturas Ativas</h3>
        <p class="stat-card__value">567</p>
        <div class="stat-card__trend">
          <BtsIcon name="arrow-trend-down" prefix="far" size="sm" color="#DB242A" />
          <span>-3% este mês</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BtsIcon } from '@bts-global/design-system';
</script>
```

### 5. Formulários

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>
        <BtsIcon name="user" prefix="far" size="sm" />
        Nome
      </label>
      <BtsInput v-model="form.name" placeholder="Digite o nome" />
    </div>

    <div class="form-group">
      <label>
        <BtsIcon name="envelope" prefix="far" size="sm" />
        Email
      </label>
      <BtsInput v-model="form.email" type="email" placeholder="Digite o email" />
    </div>

    <div class="form-group">
      <label>
        <BtsIcon name="phone" prefix="far" size="sm" />
        Telefone
      </label>
      <BtsInput v-model="form.phone" placeholder="Digite o telefone" />
    </div>

    <div class="form-actions">
      <BtsButton type="button" variant="secondary" @click="handleCancel">
        <BtsIcon name="xmark" prefix="far" size="sm" />
        Cancelar
      </BtsButton>
      <BtsButton type="submit" variant="primary">
        <BtsIcon name="floppy-disk" prefix="far" size="sm" color="#ffffff" />
        Salvar
      </BtsButton>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { BtsInput, BtsButton, BtsIcon } from '@bts-global/design-system';

const form = ref({
  name: '',
  email: '',
  phone: '',
});

const handleSubmit = () => console.log('Submit', form.value);
const handleCancel = () => console.log('Cancel');
</script>
```

---

## 🔄 Migração Gradual

### Usando BtsMigratedIcon (Temporário)

```vue
<template>
  <div class="legacy-component">
    <!-- Durante a migração, use BtsMigratedIcon -->
    <BtsMigratedIcon material-icon="home" />
    <BtsMigratedIcon material-icon="people" />
    <BtsMigratedIcon material-icon="check_circle" />

    <!-- Depois, refatore para: -->
    <!-- <BtsIcon name="house" prefix="far" /> -->
    <!-- <BtsIcon name="users" prefix="far" /> -->
    <!-- <BtsStatusIcon variant="success" /> -->
  </div>
</template>

<script setup>
import { BtsMigratedIcon } from '@bts-global/design-system';
</script>
```

---

## 🎨 Customização

### Tamanhos

```vue
<BtsIcon name="user" prefix="far" size="sm" />    <!-- 16px -->
<BtsIcon name="user" prefix="far" size="default" /> <!-- 24px -->
<BtsIcon name="user" prefix="far" size="lg" />    <!-- 32px -->
```

### Cores

```vue
<BtsIcon name="user" prefix="far" color="#18365b" />
<BtsIcon name="user" prefix="far" color="#1B9B45" />
<BtsIcon name="user" prefix="far" color="#DB242A" />
```

### Prefixes (Estilos)

```vue
<BtsIcon name="user" prefix="far" /> <!-- Regular (padrão) -->
<BtsIcon name="user" prefix="fas" /> <!-- Solid -->
<BtsIcon name="user" prefix="fal" /> <!-- Light -->
<BtsIcon name="user" prefix="fad" /> <!-- Duotone -->
```

---

## 📚 Referências

- [Mapeamento Completo](./iconMapping.js)
- [Guia de Migração](./MIGRATION_GUIDE.md)
- [Documentação](./README.md)

