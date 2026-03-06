import BtsDropdown from './BtsDropdown.vue';

/**
 * Dropdown menu component with trigger element and menu items.
 *
 * Supports keyboard navigation (ArrowDown/Up, Enter, Escape),
 * click-outside close, focus trap, custom trigger slot, and placement options.
 *
 * **Placement:** bottom-start, bottom-end, top-start, top-end
 */
export default {
  title: 'Components/Dropdown',
  component: BtsDropdown,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Default trigger label' },
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
      description: 'Menu placement relative to trigger',
    },
    disabled: { control: 'boolean', description: 'Disable the dropdown' },
  },
  args: {
    label: 'Options',
    placement: 'bottom-start',
    disabled: false,
    items: [
      { label: 'Edit', value: 'edit' },
      { label: 'Duplicate', value: 'duplicate' },
      { label: 'Archive', value: 'archive' },
      { label: 'Delete', value: 'delete', danger: true },
    ],
  },
};

const Template = (args) => ({
  components: { BtsDropdown },
  setup() {
    return { args };
  },
  template: '<BtsDropdown v-bind="args" @select="onSelect" />',
  methods: {
    onSelect(item) {
      console.log('Selected:', item);
    },
  },
});

export const Default = Template.bind({});

export const WithIcons = Template.bind({});
WithIcons.args = {
  label: 'Actions',
  items: [
    { label: 'Edit', value: 'edit', icon: 'pen' },
    { label: 'Copy', value: 'copy', icon: 'copy' },
    { label: 'Share', value: 'share', icon: 'share' },
    { label: 'Delete', value: 'delete', icon: 'trash', danger: true },
  ],
};

export const WithDisabledItems = Template.bind({});
WithDisabledItems.args = {
  label: 'Status',
  items: [
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended', disabled: true },
    { label: 'Inactive', value: 'inactive', disabled: true },
  ],
};

export const BottomEnd = Template.bind({});
BottomEnd.args = {
  placement: 'bottom-end',
};
BottomEnd.decorators = [
  () => ({ template: '<div style="display: flex; justify-content: flex-end; padding: 20px;"><story /></div>' }),
];

export const TopStart = Template.bind({});
TopStart.args = {
  placement: 'top-start',
};
TopStart.decorators = [
  () => ({ template: '<div style="padding-top: 200px;"><story /></div>' }),
];

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const CustomTrigger = () => ({
  components: { BtsDropdown },
  template: `
    <BtsDropdown
      :items="[
        { label: 'Profile', value: 'profile' },
        { label: 'Settings', value: 'settings' },
        { label: 'Logout', value: 'logout', danger: true },
      ]"
      @select="(item) => console.log('Selected:', item)"
    >
      <template #trigger>
        <button
          type="button"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: none;
            background: #f0f0f0;
            cursor: pointer;
            font-size: 16px;
          "
        >
          ⋮
        </button>
      </template>
    </BtsDropdown>
  `,
});
CustomTrigger.storyName = 'Custom Trigger (Icon Button)';

export const ManyItems = Template.bind({});
ManyItems.args = {
  label: 'Long List',
  items: Array.from({ length: 15 }, (_, i) => ({
    label: `Item ${i + 1}`,
    value: `item-${i + 1}`,
  })),
};
ManyItems.storyName = 'Many Items (Scrollable)';

