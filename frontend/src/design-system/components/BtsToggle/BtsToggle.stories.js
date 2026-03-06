import { ref } from 'vue';
import BtsToggle from './BtsToggle.vue';

/**
 * Toggle (switch) component for on/off states.
 *
 * Supports v-model for two-way binding.
 *
 * **States:** Off, On, Hover, Focus, Disabled, Error
 * **Sizes:** sm, md
 * **Label position:** left, right
 */
export default {
  title: 'Components/Toggle',
  component: BtsToggle,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'Toggle state (v-model)',
    },
    label: {
      control: 'text',
      description: 'Label text displayed next to the toggle',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the label relative to the toggle',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the toggle',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the toggle',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below the toggle',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
  },
  args: {
    modelValue: false,
    label: 'Enable notifications',
    labelPosition: 'right',
    size: 'md',
    helperText: '',
    error: '',
    disabled: false,
  },
};

const Template = (args) => ({
  components: { BtsToggle },
  setup() {
    const checked = ref(args.modelValue);
    return { args, checked };
  },
  template: '<BtsToggle v-bind="args" v-model="checked" />',
});

export const Default = Template.bind({});
Default.args = {};

export const On = Template.bind({});
On.args = {
  modelValue: true,
};

export const LabelLeft = Template.bind({});
LabelLeft.args = {
  labelPosition: 'left',
  label: 'Dark mode',
};

export const SmallSize = Template.bind({});
SmallSize.args = {
  size: 'sm',
  label: 'Compact toggle',
};

export const SmallOn = Template.bind({});
SmallOn.args = {
  size: 'sm',
  modelValue: true,
  label: 'Compact toggle on',
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: 'Auto-save',
  helperText: 'Automatically save changes every 5 minutes',
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Enable feature',
  error: 'This feature requires a premium plan',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Disabled toggle',
};

export const DisabledOn = Template.bind({});
DisabledOn.args = {
  modelValue: true,
  disabled: true,
  label: 'Disabled toggle on',
};

export const NoLabel = Template.bind({});
NoLabel.args = {
  label: '',
};

export const AllStates = () => ({
  components: { BtsToggle },
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <BtsToggle label="Off (default)" />
      <BtsToggle label="On" :modelValue="true" />
      <BtsToggle label="Label on left" labelPosition="left" />
      <BtsToggle label="Small size" size="sm" />
      <BtsToggle label="Small size on" size="sm" :modelValue="true" />
      <BtsToggle label="With helper text" helperText="Additional information" />
      <BtsToggle label="With error" error="Something went wrong" />
      <BtsToggle label="Disabled off" :disabled="true" />
      <BtsToggle label="Disabled on" :modelValue="true" :disabled="true" />
    </div>
  `,
});
AllStates.storyName = 'All States';

