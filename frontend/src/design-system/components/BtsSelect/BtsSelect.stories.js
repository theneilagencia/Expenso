import BtsSelect from './BtsSelect.vue';

/**
 * Select component based on Figma design.
 *
 * **Figma specs:**
 * - Width: 240px
 * - Height: 56px
 * - Border: 1px #575757
 * - Border radius: 8px
 * - Padding: 16px
 *
 * **Typography:**
 * - Label: Inter Regular 16px, #575757, line-height 20px
 * - Placeholder: Roboto Regular 16px, #9b9b9b, line-height 24px
 * - Chevron icon: 14x8px, color #575757
 *
 * **Variants:**
 * - HelperText: On/Off
 * - Placeholder: On/Off
 * - Error: On/Off
 * - Required: On/Off
 */
export default {
  title: 'Components/Select',
  component: BtsSelect,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text', description: 'Selected value (v-model)' },
    options: { control: 'object', description: 'Array of options [{value, label}]' },
    label: { control: 'text', description: 'Label text' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    helperText: { control: 'text', description: 'Helper text below field' },
    error: { control: 'text', description: 'Error message (shows in red)' },
    disabled: { control: 'boolean', description: 'Disabled state' },
    required: { control: 'boolean', description: 'Required field' }
  }
};

const defaultOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];

const Template = (args) => ({
  components: { BtsSelect },
  setup() { return { args }; },
  template: '<BtsSelect v-bind="args" />'
});

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  label: 'Label',
  placeholder: 'Placeholder',
  options: defaultOptions
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: 'Label',
  placeholder: 'Placeholder',
  helperText: 'Help Text',
  options: defaultOptions
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Label',
  modelValue: 'option1',
  error: 'Error message',
  options: defaultOptions
};

export const WithoutPlaceholder = Template.bind({});
WithoutPlaceholder.args = {
  label: 'Label',
  modelValue: 'option1',
  options: defaultOptions
};

export const AllVariants = () => ({
  components: { BtsSelect },
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 24px;">
      <BtsSelect label="Label" placeholder="Placeholder" helperText="Help Text" :options="[{value: '1', label: 'Option 1'}, {value: '2', label: 'Option 2'}]" />
      <BtsSelect label="Label" placeholder="Placeholder" :options="[{value: '1', label: 'Option 1'}, {value: '2', label: 'Option 2'}]" />
      <BtsSelect label="Label" modelValue="1" error="Error message" :options="[{value: '1', label: 'Option 1'}, {value: '2', label: 'Option 2'}]" />
      <BtsSelect label="Label" modelValue="1" :options="[{value: '1', label: 'Option 1'}, {value: '2', label: 'Option 2'}]" />
    </div>
  `
});

