import BtsToast from './BtsToast.vue';

/**
 * Toast component based on Figma design.
 *
 * **Figma specs:**
 * - Background: #ffffff
 * - Border: 1px solid (color varies by variant)
 * - Border radius: 12px
 * - Padding: 20px
 * - Gap: 16px
 * - StatusIcon: 32x32px
 * - Title: Inter SemiBold 14px, #000000, line-height 20px
 * - Message: Inter Regular 14px, #000000, line-height 20px
 * - Close button: 18x18px with 10x10px X icon
 *
 * **Variants (border colors):**
 * - Info: #185ab4
 * - Success: #138242
 * - Warning: #db9814
 * - Danger: #db242a
 */
export default {
  title: 'Components/Toast',
  component: BtsToast,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
      description: 'Toast variant - determines border color and icon'
    },
    title: { control: 'text', description: 'Toast title (optional)' },
    message: { control: 'text', description: 'Toast message (required)' },
    closable: { control: 'boolean', description: 'Show close button' },
    duration: { control: 'number', description: 'Auto-close duration in ms (0 = no auto-close)' }
  }
};

const Template = (args) => ({
  components: { BtsToast },
  setup() { return { args }; },
  template: '<BtsToast v-bind="args" />'
});

export const Info = Template.bind({});
Info.args = {
  variant: 'info',
  title: 'Toast Title',
  message: 'Write your message here',
  duration: 0
};

export const Success = Template.bind({});
Success.args = {
  variant: 'success',
  title: 'Toast Title',
  message: 'Write your message here',
  duration: 0
};

export const Warning = Template.bind({});
Warning.args = {
  variant: 'warning',
  title: 'Toast Title',
  message: 'Write your message here',
  duration: 0
};

export const Danger = Template.bind({});
Danger.args = {
  variant: 'danger',
  title: 'Toast Title',
  message: 'Write your message here',
  duration: 0
};

export const AllVariants = () => ({
  components: { BtsToast },
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <BtsToast variant="info" title="Toast Title" message="Write your message here" :duration="0" />
      <BtsToast variant="success" title="Toast Title" message="Write your message here" :duration="0" />
      <BtsToast variant="warning" title="Toast Title" message="Write your message here" :duration="0" />
      <BtsToast variant="danger" title="Toast Title" message="Write your message here" :duration="0" />
    </div>
  `
});

export const WithoutTitle = Template.bind({});
WithoutTitle.args = {
  variant: 'info',
  message: 'Write your message here',
  duration: 0
};

