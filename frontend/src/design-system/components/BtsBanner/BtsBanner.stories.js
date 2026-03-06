import { ref } from 'vue';
import BtsBanner from './BtsBanner.vue';
import BtsButton from '../BtsButton/BtsButton.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * Banner component for persistent notifications and alerts.
 *
 * Supports feedback variants (info, success, warning, danger),
 * dismissible option, action buttons via slot, and title/message.
 *
 * **Variants:** info, success, warning, danger
 * **Features:** dismissible, action slot, BtsStatusIcon integration
 */
export default {
  title: 'Components/Banner',
  component: BtsBanner,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
      description: 'Banner variant',
    },
    title: { control: 'text', description: 'Banner title (optional)' },
    message: { control: 'text', description: 'Banner message' },
    dismissible: { control: 'boolean', description: 'Show dismiss button' },
    visible: { control: 'boolean', description: 'Control visibility' },
  },
  args: {
    variant: 'info',
    title: '',
    message: 'This is an informational banner message.',
    dismissible: false,
    visible: true,
  },
};

const Template = (args) => ({
  components: { BtsBanner },
  setup() {
    return { args };
  },
  template: '<BtsBanner v-bind="args" />',
});

export const Info = Template.bind({});
Info.args = { variant: 'info', message: 'This is an informational message.' };

export const Success = Template.bind({});
Success.args = { variant: 'success', message: 'Operation completed successfully.' };

export const Warning = Template.bind({});
Warning.args = { variant: 'warning', message: 'Please review the changes before proceeding.' };

export const Danger = Template.bind({});
Danger.args = { variant: 'danger', message: 'An error occurred. Please try again.' };

export const WithTitle = Template.bind({});
WithTitle.args = {
  variant: 'info',
  title: 'System Update',
  message: 'A new version is available. Please update to continue.',
};

export const Dismissible = (args) => ({
  components: { BtsBanner, BtsButton },
  setup() {
    const visible = ref(true);
    function reset() { visible.value = true; }
    return { args, visible, reset };
  },
  template: `
    <div>
      <BtsBanner v-bind="args" :visible="visible" dismissible @dismiss="visible = false" />
      <BtsButton v-if="!visible" variant="secondary" size="sm" @click="reset">
        Show banner again
      </BtsButton>
    </div>
  `,
});
Dismissible.args = {
  variant: 'warning',
  title: 'Attention',
  message: 'Your session will expire in 5 minutes.',
};

export const WithActions = () => ({
  components: { BtsBanner, BtsButton, BtsText },
  template: `
    <BtsBanner
      variant="warning"
      title="We need your help"
      message="We need you to update the documentation"
    >
      <template #default>
        <BtsText tag="span" variant="body-sm">* CNH</BtsText>
      </template>
      <template #actions>
        <BtsButton variant="primary" size="sm">Send Now</BtsButton>
      </template>
    </BtsBanner>
  `,
});

export const AllVariants = () => ({
  components: { BtsBanner },
  template: `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <BtsBanner variant="info" title="Info" message="This is an informational banner." dismissible />
      <BtsBanner variant="success" title="Success" message="Operation completed successfully." dismissible />
      <BtsBanner variant="warning" title="Warning" message="Please review the changes before proceeding." dismissible />
      <BtsBanner variant="danger" title="Error" message="An error occurred. Please try again later." dismissible />
    </div>
  `,
});
AllVariants.storyName = 'All Variants';

