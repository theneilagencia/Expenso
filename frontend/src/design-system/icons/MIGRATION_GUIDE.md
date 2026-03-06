# 🔄 Guia de Migração: Material Icons → FontAwesome

Este guia ajuda na migração de Material Icons (Quasar) para FontAwesome (BTS Design System).

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estratégias de Migração](#estratégias-de-migração)
3. [Exemplos Práticos](#exemplos-práticos)
4. [Casos Especiais](#casos-especiais)
5. [Checklist](#checklist)

---

## 🎯 Visão Geral

### Antes (Material Icons + Quasar)
```vue
<q-icon name="home" />
<q-icon name="people" color="primary" />
<q-icon name="check_circle" color="positive" />
```

### Depois (FontAwesome + BTS Design System)
```vue
<BtsIcon name="house" prefix="far" />
<BtsIcon name="users" prefix="far" color="#18365b" />
<BtsStatusIcon type="success" />
```

---

## 🚀 Estratégias de Migração

### Estratégia 1: Migração Direta (Recomendada)

Substitua diretamente os ícones usando o mapeamento.

**Vantagens:**
- ✅ Código final mais limpo
- ✅ Melhor performance
- ✅ Type-safe

**Exemplo:**
```vue
<!-- ANTES -->
<q-icon name="home" />

<!-- DEPOIS -->
<BtsIcon name="house" prefix="far" />
```

### Estratégia 2: Migração Gradual (Temporária)

Use o componente `BtsMigratedIcon` durante a transição.

**Vantagens:**
- ✅ Migração mais rápida
- ✅ Menos mudanças de código
- ⚠️ Deve ser temporário

**Exemplo:**
```vue
<!-- ANTES -->
<q-icon name="home" />

<!-- DURANTE MIGRAÇÃO -->
<BtsMigratedIcon material-icon="home" />

<!-- DEPOIS (refatorar para) -->
<BtsIcon name="house" prefix="far" />
```

### Estratégia 3: Busca e Substituição

Use regex para encontrar e substituir em massa.

**Padrões de busca:**
```regex
# Encontrar q-icon
<q-icon\s+name="([^"]+)"

# Encontrar q-btn com ícone
<q-btn[^>]*icon="([^"]+)"
```

---

## 💡 Exemplos Práticos

### Navegação

```vue
<!-- ANTES -->
<q-icon name="home" />
<q-icon name="dashboard" />
<q-icon name="settings" />
<q-icon name="menu" />

<!-- DEPOIS -->
<BtsIcon name="house" prefix="far" />
<BtsIcon name="chart-line" prefix="far" />
<BtsIcon name="gear" prefix="far" />
<BtsIcon name="bars" prefix="far" />
```

### Usuários

```vue
<!-- ANTES -->
<q-icon name="person" />
<q-icon name="people" />
<q-icon name="person_add" />

<!-- DEPOIS -->
<BtsIcon name="user" prefix="far" />
<BtsIcon name="users" prefix="far" />
<BtsIcon name="user-plus" prefix="far" />
```

### Ações

```vue
<!-- ANTES -->
<q-icon name="add" />
<q-icon name="edit" />
<q-icon name="delete" />
<q-icon name="save" />

<!-- DEPOIS -->
<BtsIcon name="plus" prefix="far" />
<BtsIcon name="pen" prefix="far" />
<BtsIcon name="trash" prefix="far" />
<BtsIcon name="floppy-disk" prefix="far" />
```

### Status (Usar BtsStatusIcon)

```vue
<!-- ANTES -->
<q-icon name="check_circle" color="positive" />
<q-icon name="warning" color="warning" />
<q-icon name="error" color="negative" />
<q-icon name="info" color="info" />

<!-- DEPOIS -->
<BtsStatusIcon variant="success" />
<BtsStatusIcon variant="warning" />
<BtsStatusIcon variant="danger" />
<BtsStatusIcon variant="info" />
```

---

## 🔧 Casos Especiais

### Botões com Ícones

```vue
<!-- ANTES -->
<q-btn icon="add" label="Adicionar" />
<q-btn icon="delete" flat />

<!-- DEPOIS -->
<BtsButton>
  <BtsIcon name="plus" prefix="far" size="sm" />
  Adicionar
</BtsButton>
<BtsIconButton icon="trash" variant="secondary" />
```

### Ícones em Tabelas

```vue
<!-- ANTES -->
<q-td>
  <q-icon name="edit" class="cursor-pointer" @click="edit(row)" />
  <q-icon name="delete" class="cursor-pointer" @click="remove(row)" />
</q-td>

<!-- DEPOIS -->
<td>
  <BtsIconButton icon="pen" variant="secondary" size="sm" @click="edit(row)" />
  <BtsIconButton icon="trash" variant="secondary" size="sm" @click="remove(row)" />
</td>
```

### Ícones Condicionais

```vue
<!-- ANTES -->
<q-icon :name="isActive ? 'check_circle' : 'error'" />

<!-- DEPOIS -->
<BtsStatusIcon :variant="isActive ? 'success' : 'danger'" />
```

---

## ✅ Checklist de Migração

### Por Módulo (client, admin, partner)

- [ ] **1. Preparação**
  - [ ] Instalar `@bts-global/design-system` atualizado
  - [ ] Importar módulo de ícones
  - [ ] Revisar mapeamento de ícones

- [ ] **2. Navegação/Sidebar**
  - [ ] Substituir ícones do menu principal
  - [ ] Substituir ícones de navegação
  - [ ] Testar navegação

- [ ] **3. Dashboard**
  - [ ] Substituir ícones de cards
  - [ ] Substituir ícones de estatísticas
  - [ ] Substituir ícones de ações

- [ ] **4. Formulários**
  - [ ] Substituir ícones de inputs
  - [ ] Substituir ícones de botões
  - [ ] Substituir ícones de validação

- [ ] **5. Tabelas/Listas**
  - [ ] Substituir ícones de ações
  - [ ] Substituir ícones de status
  - [ ] Substituir ícones de ordenação

- [ ] **6. Modais/Dialogs**
  - [ ] Substituir ícones de cabeçalho
  - [ ] Substituir ícones de ações
  - [ ] Substituir ícones de status

- [ ] **7. Notificações**
  - [ ] Substituir por BtsStatusIcon
  - [ ] Testar todos os tipos (success, warning, error, info)

- [ ] **8. Testes**
  - [ ] Testar visualmente todas as páginas
  - [ ] Verificar responsividade
  - [ ] Verificar acessibilidade
  - [ ] Verificar performance

- [ ] **9. Limpeza**
  - [ ] Remover imports de Material Icons
  - [ ] Remover dependências não utilizadas
  - [ ] Atualizar documentação

---

## 📊 Tabela de Referência Rápida

| Material | FontAwesome | Componente |
|----------|-------------|------------|
| `home` | `house` | BtsIcon |
| `dashboard` | `chart-line` | BtsIcon |
| `people` | `users` | BtsIcon |
| `business` | `building` | BtsIcon |
| `description` | `file-lines` | BtsIcon |
| `check_circle` | - | BtsStatusIcon (success) |
| `warning` | - | BtsStatusIcon (warning) |
| `error` | - | BtsStatusIcon (error) |
| `info` | - | BtsStatusIcon (info) |

**Ver mapeamento completo em:** `src/icons/iconMapping.js`

---

## 🆘 Problemas Comuns

### Ícone não aparece
- ✅ Verificar se o nome está correto
- ✅ Verificar se o prefix está correto (`far`, `fas`)
- ✅ Verificar se os ícones foram registrados

### Ícone com tamanho errado
- ✅ Usar prop `size` (`sm`, `default`, `lg`)
- ✅ Verificar CSS customizado

### Ícone com cor errada
- ✅ Usar prop `color` com valor hexadecimal
- ✅ Para status, usar BtsStatusIcon (cores automáticas)

---

## 📚 Recursos

- [Mapeamento Completo](./iconMapping.js)
- [Documentação de Ícones](./README.md)
- [FontAwesome Icons](https://fontawesome.com/icons)
- [BTS Design System Storybook](http://localhost:6006)

