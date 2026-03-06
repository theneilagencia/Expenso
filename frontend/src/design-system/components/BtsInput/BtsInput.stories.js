import BtsInput from './BtsInput.vue';

/**
 * Input component based on Figma design.
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
 * - Helper text: Inter Regular 12px, #575757, line-height 16px
 *
 * **Variants:**
 * - Type: Text, Email, Password, Number, Tel, URL, Search
 * - HelperText: On/Off
 * - Placeholder: On/Off
 * - Error: On/Off
 * - Required: On/Off
 */
export default {
  title: 'Components/Input',
  component: BtsInput,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'Input type'
    },
    modelValue: { control: 'text', description: 'Input value (v-model)' },
    label: { control: 'text', description: 'Label text' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    helperText: { control: 'text', description: 'Helper text below field' },
    error: { control: 'text', description: 'Error message (shows in red)' },
    disabled: { control: 'boolean', description: 'Disabled state' },
    readonly: { control: 'boolean', description: 'Readonly state' },
    required: { control: 'boolean', description: 'Required field' },
    maxlength: { control: 'number', description: 'Maximum character length' }
  }
};

const Template = (args) => ({
  components: { BtsInput },
  setup() { return { args }; },
  template: '<BtsInput v-bind="args" />'
});

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  label: 'Label',
  placeholder: 'Placeholder'
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: 'Label',
  placeholder: 'Placeholder',
  helperText: 'Help Text'
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Label',
  modelValue: 'Some text',
  error: 'Error message'
};

export const WithoutPlaceholder = Template.bind({});
WithoutPlaceholder.args = {
  label: 'Label',
  modelValue: ''
};

export const Types = () => ({
  components: { BtsInput },
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 24px;">
      <BtsInput type="text" label="Text" placeholder="Text input" />
      <BtsInput type="email" label="Email" placeholder="email@example.com" />
      <BtsInput type="password" label="Password" placeholder="••••••••" />
      <BtsInput type="number" label="Number" placeholder="123" />
      <BtsInput type="tel" label="Phone" placeholder="(11) 99999-9999" />
    </div>
  `
});

export const AllVariants = () => ({
  components: { BtsInput },
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 24px;">
      <BtsInput label="Label" placeholder="Placeholder" helperText="Help Text" />
      <BtsInput label="Label" placeholder="Placeholder" />
      <BtsInput label="Label" modelValue="Some text" error="Error message" />
      <BtsInput label="Label" />
    </div>
  `
});

