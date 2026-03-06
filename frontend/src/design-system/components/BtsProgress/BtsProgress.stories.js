import BtsProgress from './BtsProgress.vue';

/**
 * Progress bar component for tracking completion.
 *
 * Supports determinate (percentage) and indeterminate (loading) modes.
 *
 * **Sizes:** sm (4px), md (8px), lg (12px)
 * **Variants:** primary, success, warning, danger
 */
export default {
  title: 'Components/Progress',
  component: BtsProgress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    variant: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger'],
      description: 'Color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Height of the progress bar',
    },
    label: {
      control: 'text',
      description: 'Label text above the bar',
    },
    showValue: {
      control: 'boolean',
      description: 'Show percentage value',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate loading mode',
    },
  },
  args: {
    value: 60,
    max: 100,
    variant: 'primary',
    size: 'md',
    label: '',
    showValue: false,
    indeterminate: false,
  },
};

const Template = (args) => ({
  components: { BtsProgress },
  setup() {
    return { args };
  },
  template: '<BtsProgress v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};

export const WithLabelAndValue = Template.bind({});
WithLabelAndValue.args = {
  label: 'Uploading files...',
  showValue: true,
  value: 73,
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  indeterminate: true,
  label: 'Processing...',
};

export const Small = Template.bind({});
Small.args = { size: 'sm', value: 45 };

export const Large = Template.bind({});
Large.args = { size: 'lg', value: 80 };

export const Success = Template.bind({});
Success.args = { variant: 'success', value: 100, label: 'Complete', showValue: true };

export const Warning = Template.bind({});
Warning.args = { variant: 'warning', value: 65, label: 'Storage usage', showValue: true };

export const Danger = Template.bind({});
Danger.args = { variant: 'danger', value: 90, label: 'Disk space', showValue: true };

export const AllVariants = () => ({
  components: { BtsProgress },
  template: `
    <div style="display: flex; flex-direction: column; gap: 20px; max-width: 400px;">
      <BtsProgress variant="primary" :value="60" label="Primary" :showValue="true" />
      <BtsProgress variant="success" :value="100" label="Success" :showValue="true" />
      <BtsProgress variant="warning" :value="65" label="Warning" :showValue="true" />
      <BtsProgress variant="danger" :value="90" label="Danger" :showValue="true" />
      <BtsProgress :indeterminate="true" label="Indeterminate" />
    </div>
  `,
});
AllVariants.storyName = 'All Variants';

export const AllSizes = () => ({
  components: { BtsProgress },
  template: `
    <div style="display: flex; flex-direction: column; gap: 20px; max-width: 400px;">
      <BtsProgress size="sm" :value="50" label="Small (4px)" :showValue="true" />
      <BtsProgress size="md" :value="50" label="Medium (8px)" :showValue="true" />
      <BtsProgress size="lg" :value="50" label="Large (12px)" :showValue="true" />
    </div>
  `,
});
AllSizes.storyName = 'All Sizes';

