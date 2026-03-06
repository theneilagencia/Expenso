import BtsIconButton from './BtsIconButton.vue';
import BtsHeading from '../BtsHeading/BtsHeading.vue';

/**
 * IconButton component based on Figma design.
 *
 * **Figma specs:**
 * - Types: Primary, Secondary
 * - Sizes: md (48x48px, padding 16px, icon 24px), sm (32x32px, padding 8px, icon 16px)
 * - Border radius: 8px
 *
 * **Colors:**
 * - Primary: background #18365b, icon #ffffff
 * - Primary Disabled: background #c6c6c6, icon #ffffff
 * - Secondary md: background #ffffff, border 1px #18365b, icon #18365b
 * - Secondary Focus: border 2px #2eb5f3, icon #18365b
 * - Secondary Disabled: border 1px #9b9b9b, icon #9b9b9b
 *
 * **Usage:**
 * Uses Font Awesome icons via the `icon` prop.
 */
export default {
  title: 'Components/IconButton',
  component: BtsIconButton,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'text',
      description: 'Font Awesome icon name (e.g., "search", "plus", "trash")',
    },
    iconPrefix: {
      control: 'select',
      options: ['far', 'fas', 'fab'],
      description: 'Font Awesome prefix',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Button variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    onClick: {
      action: 'clicked',
    },
  },
};

const Template = (args) => ({
  components: { BtsIconButton },
  setup() { return { args }; },
  template: `<BtsIconButton v-bind="args" />`,
});

export const Primary = Template.bind({});
Primary.args = { icon: 'magnifying-glass', variant: 'primary' };

export const Secondary = Template.bind({});
Secondary.args = { icon: 'magnifying-glass', variant: 'secondary' };

export const Ghost = Template.bind({});
Ghost.args = { icon: 'magnifying-glass', variant: 'ghost' };

export const SizeSmall = Template.bind({});
SizeSmall.args = { icon: 'magnifying-glass', size: 'sm' };

export const SizeMedium = Template.bind({});
SizeMedium.args = { icon: 'magnifying-glass', size: 'md' };

export const SizeLarge = Template.bind({});
SizeLarge.args = { icon: 'magnifying-glass', size: 'lg' };

export const Disabled = Template.bind({});
Disabled.args = { icon: 'magnifying-glass', disabled: true };

export const AllVariants = () => ({
  components: { BtsIconButton, BtsHeading },
  template: `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <BtsHeading level="h3" no-margin style="margin-bottom: 12px;">Primary</BtsHeading>
        <div style="display: flex; gap: 12px; align-items: center;">
          <BtsIconButton icon="magnifying-glass" variant="primary" size="sm" />
          <BtsIconButton icon="magnifying-glass" variant="primary" size="md" />
          <BtsIconButton icon="magnifying-glass" variant="primary" size="lg" />
          <BtsIconButton icon="magnifying-glass" variant="primary" disabled />
        </div>
      </div>
      <div>
        <BtsHeading level="h3" no-margin style="margin-bottom: 12px;">Secondary</BtsHeading>
        <div style="display: flex; gap: 12px; align-items: center;">
          <BtsIconButton icon="magnifying-glass" variant="secondary" size="sm" />
          <BtsIconButton icon="magnifying-glass" variant="secondary" size="md" />
          <BtsIconButton icon="magnifying-glass" variant="secondary" size="lg" />
          <BtsIconButton icon="magnifying-glass" variant="secondary" disabled />
        </div>
      </div>
      <div>
        <BtsHeading level="h3" no-margin style="margin-bottom: 12px;">Ghost</BtsHeading>
        <div style="display: flex; gap: 12px; align-items: center;">
          <BtsIconButton icon="magnifying-glass" variant="ghost" size="sm" />
          <BtsIconButton icon="magnifying-glass" variant="ghost" size="md" />
          <BtsIconButton icon="magnifying-glass" variant="ghost" size="lg" />
          <BtsIconButton icon="magnifying-glass" variant="ghost" disabled />
        </div>
      </div>
    </div>
  `,
});

export const DifferentIcons = () => ({
  components: { BtsIconButton },
  template: `
    <div style="display: flex; gap: 12px; align-items: center;">
      <BtsIconButton icon="plus" variant="primary" />
      <BtsIconButton icon="trash" variant="primary" />
      <BtsIconButton icon="pen" variant="primary" />
      <BtsIconButton icon="xmark" variant="secondary" />
      <BtsIconButton icon="check" variant="secondary" />
    </div>
  `,
});
DifferentIcons.storyName = 'Different Icons';

