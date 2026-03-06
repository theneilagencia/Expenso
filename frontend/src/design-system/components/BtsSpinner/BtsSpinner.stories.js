import BtsSpinner from './BtsSpinner.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * Circular loading spinner indicator.
 *
 * **Sizes:** sm (16px), md (32px), lg (48px)
 * **Variants:** primary (blue), secondary (white for dark backgrounds)
 */
export default {
  title: 'Components/Spinner',
  component: BtsSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the spinner',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Color variant of the spinner',
    },
    label: {
      control: 'text',
      description: 'Accessible label for screen readers',
    },
  },
  args: {
    size: 'md',
    variant: 'primary',
    label: 'Loading',
  },
};

const Template = (args) => ({
  components: { BtsSpinner },
  setup() {
    return { args };
  },
  template: '<BtsSpinner v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};

export const Small = Template.bind({});
Small.args = {
  size: 'sm',
};

export const Large = Template.bind({});
Large.args = {
  size: 'lg',
};

export const Secondary = (args) => ({
  components: { BtsSpinner },
  setup() {
    return { args };
  },
  template: `
    <div style="background: #122539; padding: 24px; border-radius: 8px; display: inline-flex;">
      <BtsSpinner v-bind="args" />
    </div>
  `,
});
Secondary.args = {
  variant: 'secondary',
};

export const AllSizes = () => ({
  components: { BtsSpinner, BtsText },
  template: `
    <div style="display: flex; align-items: center; gap: 24px;">
      <div style="text-align: center;">
        <BtsSpinner size="sm" />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 8px;">sm (16px)</BtsText>
      </div>
      <div style="text-align: center;">
        <BtsSpinner size="md" />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 8px;">md (32px)</BtsText>
      </div>
      <div style="text-align: center;">
        <BtsSpinner size="lg" />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 8px;">lg (48px)</BtsText>
      </div>
    </div>
  `,
});
AllSizes.storyName = 'All Sizes';

export const AllVariants = () => ({
  components: { BtsSpinner, BtsText },
  template: `
    <div style="display: flex; align-items: center; gap: 24px;">
      <div style="text-align: center;">
        <BtsSpinner variant="primary" size="lg" />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 8px;">primary</BtsText>
      </div>
      <div style="text-align: center; background: #122539; padding: 16px; border-radius: 8px;">
        <BtsSpinner variant="secondary" size="lg" />
        <BtsText variant="caption" color="tertiary" no-margin style="margin-top: 8px;">secondary</BtsText>
      </div>
    </div>
  `,
});
AllVariants.storyName = 'All Variants';

