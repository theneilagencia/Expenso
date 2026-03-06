import { ref } from 'vue';
import BtsBreadcrumb from './BtsBreadcrumb.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * Breadcrumb navigation component for hierarchical page structure.
 *
 * Supports router-link, anchor, and plain text items.
 * Custom separators via prop or slot.
 *
 * **Features:** router integration, custom separator, keyboard accessible
 */
export default {
  title: 'Components/Breadcrumb',
  component: BtsBreadcrumb,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of breadcrumb items ({ label, to?, href? })',
    },
    separator: {
      control: 'text',
      description: 'Separator character between items',
    },
  },
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Category' },
    ],
    separator: '/',
  },
};

const Template = (args) => ({
  components: { BtsBreadcrumb },
  setup() {
    return { args };
  },
  template: '<BtsBreadcrumb v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};

export const WithRouterLinks = Template.bind({});
WithRouterLinks.args = {
  items: [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Settings' },
  ],
};

export const CustomSeparator = Template.bind({});
CustomSeparator.args = {
  separator: '>',
  items: [
    { label: 'Home', href: '#' },
    { label: 'Users', href: '#' },
    { label: 'John Doe' },
  ],
};

export const ChevronSeparator = () => ({
  components: { BtsBreadcrumb, BtsText },
  template: `
    <BtsBreadcrumb :items="items">
      <template #separator>
        <BtsText tag="span" variant="caption" no-margin>›</BtsText>
      </template>
    </BtsBreadcrumb>
  `,
  setup() {
    return {
      items: [
        { label: 'Home', href: '#' },
        { label: 'Library', href: '#' },
        { label: 'Current Page' },
      ],
    };
  },
});

export const LongPath = Template.bind({});
LongPath.args = {
  items: [
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#' },
    { label: 'Electronics', href: '#' },
    { label: 'Computers', href: '#' },
    { label: 'Laptops', href: '#' },
    { label: 'MacBook Pro' },
  ],
};

export const SingleItem = Template.bind({});
SingleItem.args = {
  items: [{ label: 'Home' }],
};

export const WithNavigateEvent = () => ({
  components: { BtsBreadcrumb, BtsText },
  template: `
    <div>
      <BtsBreadcrumb :items="items" @navigate="onNavigate" />
      <BtsText v-if="lastClicked" variant="body-sm" color="secondary" style="margin-top: 12px;">
        Last clicked: <strong>{{ lastClicked }}</strong>
      </BtsText>
    </div>
  `,
  setup() {

    const lastClicked = ref('');
    const items = [
      { label: 'Home', href: '#' },
      { label: 'Settings', href: '#' },
      { label: 'Profile' },
    ];
    function onNavigate({ item }) {
      lastClicked.value = item.label;
    }
    return { items, lastClicked, onNavigate };
  },
});

