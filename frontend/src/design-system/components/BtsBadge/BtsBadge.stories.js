import BtsBadge from './BtsBadge.vue';

/**
 * Badge component based on Figma design
 *
 * Figma specs:
 * - Font: Montserrat SemiBold 12px
 * - Padding: 8px horizontal, 2px vertical
 * - Border radius: 4px
 * - Variants: Success (default), Warning, Danger, Info, Default, Primary
 */
export default {
  title: 'Components/Badge',
  component: BtsBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'danger', 'info', 'default', 'primary'],
      description: 'Badge variant (according to Figma)'
    },
    label: {
      control: 'text',
      description: 'Badge text'
    }
  }
};

const Template = (args) => ({
  components: { BtsBadge },
  setup() { return { args }; },
  template: '<BtsBadge v-bind="args" />'
});

export const Success = Template.bind({});
Success.args = { variant: 'success', label: 'Label' };

export const Warning = Template.bind({});
Warning.args = { variant: 'warning', label: 'Label' };

export const Danger = Template.bind({});
Danger.args = { variant: 'danger', label: 'Label' };

export const Info = Template.bind({});
Info.args = { variant: 'info', label: 'Label' };

export const Default = Template.bind({});
Default.args = { variant: 'default', label: 'Label' };

export const Primary = Template.bind({});
Primary.args = { variant: 'primary', label: 'Label' };

export const AllVariants = () => ({
  components: { BtsBadge },
  template: `
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <BtsBadge variant="success" label="Success" />
      <BtsBadge variant="warning" label="Warning" />
      <BtsBadge variant="danger" label="Danger" />
      <BtsBadge variant="info" label="Info" />
      <BtsBadge variant="default" label="Default" />
      <BtsBadge variant="primary" label="Primary" />
    </div>
  `
});
AllVariants.storyName = 'All Variants (Figma)';

