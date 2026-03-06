import BtsCheckbox from './BtsCheckbox.vue';

/**
 * Checkbox component with label, indeterminate state, error and helper text support.
 *
 * Supports v-model for two-way binding.
 *
 * **States:** Default, Hover, Focus, Checked, Indeterminate, Disabled, Error
 */
export default {
  title: 'Components/Checkbox',
  component: BtsCheckbox,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'Checked state (v-model)',
    },
    label: {
      control: 'text',
      description: 'Label text displayed next to the checkbox',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the checkbox',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below the checkbox',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in indeterminate state',
    },
  },
  args: {
    modelValue: false,
    label: 'Accept terms and conditions',
    helperText: '',
    error: '',
    disabled: false,
    required: false,
    indeterminate: false,
  },
};

const Template = (args) => ({
  components: { BtsCheckbox },
  setup() {
    return { args };
  },
  template: '<BtsCheckbox v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};

export const Checked = Template.bind({});
Checked.args = {
  modelValue: true,
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  indeterminate: true,
  label: 'Select all items',
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: 'Subscribe to newsletter',
  helperText: 'You can unsubscribe at any time',
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Accept terms and conditions',
  error: 'You must accept the terms to continue',
};

export const CheckedWithError = Template.bind({});
CheckedWithError.args = {
  modelValue: true,
  label: 'Accept terms and conditions',
  error: 'Invalid selection',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Disabled option',
};

export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  modelValue: true,
  disabled: true,
  label: 'Disabled checked option',
};

export const DisabledIndeterminate = Template.bind({});
DisabledIndeterminate.args = {
  indeterminate: true,
  disabled: true,
  label: 'Disabled indeterminate',
};

export const NoLabel = Template.bind({});
NoLabel.args = {
  label: '',
};

export const AllStates = () => ({
  components: { BtsCheckbox },
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <BtsCheckbox label="Unchecked (default)" />
      <BtsCheckbox label="Checked" :modelValue="true" />
      <BtsCheckbox label="Indeterminate" :indeterminate="true" />
      <BtsCheckbox label="With helper text" helperText="Additional information" />
      <BtsCheckbox label="With error" error="This field is required" />
      <BtsCheckbox label="Checked with error" :modelValue="true" error="Invalid selection" />
      <BtsCheckbox label="Disabled" :disabled="true" />
      <BtsCheckbox label="Disabled checked" :modelValue="true" :disabled="true" />
      <BtsCheckbox label="Disabled indeterminate" :indeterminate="true" :disabled="true" />
    </div>
  `,
});
AllStates.storyName = 'All States';

