import { ref } from 'vue';
import BtsRadio from './BtsRadio.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * Radio button component for single selection within a group.
 *
 * Supports v-model for two-way binding. Use the same `name` prop
 * across multiple BtsRadio instances to create a radio group.
 *
 * **States:** Default, Hover, Focus, Selected, Disabled, Error
 */
export default {
  title: 'Components/Radio',
  component: BtsRadio,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Selected value (v-model)',
    },
    value: {
      control: 'text',
      description: 'Value of this radio option',
    },
    name: {
      control: 'text',
      description: 'Name attribute for grouping radio buttons',
    },
    label: {
      control: 'text',
      description: 'Label text displayed next to the radio button',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the radio button',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below the radio button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the radio button is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the radio button is required',
    },
  },
  args: {
    modelValue: '',
    value: 'option1',
    name: 'demo-group',
    label: 'Option 1',
    helperText: '',
    error: '',
    disabled: false,
    required: false,
  },
};

const Template = (args) => ({
  components: { BtsRadio },
  setup() {
    const selected = ref(args.modelValue);
    return { args, selected };
  },
  template: '<BtsRadio v-bind="args" v-model="selected" />',
});

export const Default = Template.bind({});
Default.args = {};

export const Selected = Template.bind({});
Selected.args = {
  modelValue: 'option1',
  value: 'option1',
  label: 'Selected option',
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: 'Standard plan',
  helperText: 'Best for small teams up to 10 members',
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Payment method',
  error: 'Please select a payment method',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Disabled option',
};

export const DisabledSelected = Template.bind({});
DisabledSelected.args = {
  modelValue: 'option1',
  value: 'option1',
  disabled: true,
  label: 'Disabled selected option',
};

export const RadioGroup = () => ({
  components: { BtsRadio, BtsText },
  data() {
    return { selected: 'standard' };
  },
  template: `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <BtsText variant="body-sm" weight="medium" no-margin>Select a plan:</BtsText>
      <BtsRadio v-model="selected" value="basic" name="plan" label="Basic" helperText="Free forever" />
      <BtsRadio v-model="selected" value="standard" name="plan" label="Standard" helperText="$10/month" />
      <BtsRadio v-model="selected" value="premium" name="plan" label="Premium" helperText="$25/month" />
      <BtsRadio v-model="selected" value="enterprise" name="plan" label="Enterprise" helperText="Custom pricing" :disabled="true" />
      <BtsText variant="caption" color="secondary" no-margin>Selected: {{ selected }}</BtsText>
    </div>
  `,
});
RadioGroup.storyName = 'Radio Group';

export const AllStates = () => ({
  components: { BtsRadio },
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <BtsRadio value="1" name="states" label="Unselected (default)" />
      <BtsRadio value="2" modelValue="2" name="states2" label="Selected" />
      <BtsRadio value="3" name="states3" label="With helper text" helperText="Additional information" />
      <BtsRadio value="4" name="states4" label="With error" error="This field is required" />
      <BtsRadio value="5" modelValue="5" name="states5" label="Selected with error" error="Invalid selection" />
      <BtsRadio value="6" name="states6" label="Disabled" :disabled="true" />
      <BtsRadio value="7" modelValue="7" name="states7" label="Disabled selected" :disabled="true" />
    </div>
  `,
});
AllStates.storyName = 'All States';

