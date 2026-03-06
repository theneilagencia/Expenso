import BtsTextArea from './BtsTextArea.vue';

/**
 * TextArea component based on Figma design.
 *
 * **Figma specs:**
 * - Width: 240px
 * - Border: 1px rgba(0,0,0,0.5)
 * - Border radius: 8px
 * - Padding: 16px
 * - Min height: 128px
 *
 * **Typography:**
 * - Label: Inter Regular 16px, rgba(0,0,0,0.5), line-height 20px
 * - Placeholder: Inter Regular 14px, #9b9b9b, line-height 20px
 * - Help text: Inter Regular 12px, #575757, line-height 16px
 * - Character count: Inter Regular 12px, #575757, line-height 16px
 *
 * **Variants:**
 * - HelperText: On/Off
 * - Error: On/Off
 * - Placeholder: On/Off
 */
export default {
  title: 'Components/TextArea',
  component: BtsTextArea,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text', description: 'Text value (v-model)' },
    label: { control: 'text', description: 'Label text' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    helperText: { control: 'text', description: 'Helper text below field' },
    error: { control: 'text', description: 'Error message (shows in red)' },
    disabled: { control: 'boolean', description: 'Disabled state' },
    required: { control: 'boolean', description: 'Required field' },
    rows: { control: 'number', description: 'Number of rows' },
    maxlength: { control: 'number', description: 'Maximum character length' },
    showCounter: { control: 'boolean', description: 'Show character counter' }
  }
};

const Template = (args) => ({
  components: { BtsTextArea },
  setup() { return { args }; },
  template: '<BtsTextArea v-bind="args" />'
});

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  label: 'Label',
  placeholder: 'Write your message here.',
  maxlength: 200,
  showCounter: true
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  label: 'Label',
  placeholder: 'Write your message here.',
  helperText: 'Help Text',
  maxlength: 200,
  showCounter: true
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Label',
  modelValue: 'Some text content',
  error: 'Error message',
  maxlength: 200,
  showCounter: true
};

export const WithoutPlaceholder = Template.bind({});
WithoutPlaceholder.args = {
  label: 'Label',
  modelValue: '',
  maxlength: 200,
  showCounter: true
};

export const AllVariants = () => ({
  components: { BtsTextArea },
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 24px;">
      <BtsTextArea label="Label" placeholder="Write your message here." helperText="Help Text" :maxlength="200" :showCounter="true" />
      <BtsTextArea label="Label" placeholder="Write your message here." :maxlength="200" :showCounter="true" />
      <BtsTextArea label="Label" modelValue="Some text" error="Error message" :maxlength="200" :showCounter="true" />
      <BtsTextArea label="Label" :maxlength="200" :showCounter="true" />
    </div>
  `
});

