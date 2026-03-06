import BtsButton from './BtsButton.vue';
import BtsHeading from '../BtsHeading/BtsHeading.vue';

/**
 * Button component based on Figma design.
 *
 * **Figma specs:**
 * - Types: Primary, Secondary, Tertiary, Danger
 * - Sizes: Default (48px height, padding 16px 24px), sm (36px height, padding 8px 12px)
 * - States: Default, Hover, Pressed, Disabled
 * - Icons: IconLeft, IconRight (via slots)
 * - Border radius: 8px
 *
 * **Typography:**
 * - Font: Inter SemiBold 14px, line-height 20px
 *
 * **Colors:**
 * - Primary: background #18365b, text #ffffff
 * - Secondary: background transparent, border #18365b, text #18365b
 * - Tertiary: background transparent, text #185ab4
 * - Danger: background #db242a, text #ffffff
 * - Disabled: background #c6c6c6, text #ffffff
 */
export default {
  title: 'Components/Button',
  component: BtsButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger'],
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
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
    default: {
      control: 'text',
      description: 'Button label',
    },
    onClick: {
      action: 'clicked',
    },
  },
};

const Template = (args) => ({
  components: { BtsButton },
  setup() { return { args }; },
  template: '<BtsButton v-bind="args">{{ args.default || "New proposal" }}</BtsButton>',
});

export const Primary = Template.bind({});
Primary.args = { variant: 'primary', default: 'New proposal' };

export const Secondary = Template.bind({});
Secondary.args = { variant: 'secondary', default: 'New proposal' };

export const Tertiary = Template.bind({});
Tertiary.args = { variant: 'tertiary', default: 'New proposal' };

export const Danger = Template.bind({});
Danger.args = { variant: 'danger', default: 'New proposal' };

export const SizeSmall = Template.bind({});
SizeSmall.args = { size: 'sm', default: 'New proposal' };

export const SizeMedium = Template.bind({});
SizeMedium.args = { size: 'md', default: 'New proposal' };

export const Disabled = Template.bind({});
Disabled.args = { disabled: true, default: 'New proposal' };

export const AllVariants = () => ({
  components: { BtsButton, BtsHeading },
  template: `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <BtsHeading level="h3" no-margin style="margin-bottom: 12px;">Primary</BtsHeading>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <BtsButton variant="primary" size="sm">New proposal</BtsButton>
          <BtsButton variant="primary" size="md">New proposal</BtsButton>
          <BtsButton variant="primary" disabled>New proposal</BtsButton>
        </div>
      </div>
      <div>
        <BtsHeading level="h3" no-margin style="margin-bottom: 12px;">Secondary</BtsHeading>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <BtsButton variant="secondary" size="sm">New proposal</BtsButton>
          <BtsButton variant="secondary" size="md">New proposal</BtsButton>
          <BtsButton variant="secondary" disabled>New proposal</BtsButton>
        </div>
      </div>
      <div>
        <BtsHeading level="h3" no-margin style="margin-bottom: 12px;">Tertiary</BtsHeading>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <BtsButton variant="tertiary" size="sm">New proposal</BtsButton>
          <BtsButton variant="tertiary" size="md">New proposal</BtsButton>
          <BtsButton variant="tertiary" disabled>New proposal</BtsButton>
        </div>
      </div>
      <div>
        <BtsHeading level="h3" no-margin style="margin-bottom: 12px;">Danger</BtsHeading>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <BtsButton variant="danger" size="sm">New proposal</BtsButton>
          <BtsButton variant="danger" size="md">New proposal</BtsButton>
          <BtsButton variant="danger" disabled>New proposal</BtsButton>
        </div>
      </div>
    </div>
  `,
});

