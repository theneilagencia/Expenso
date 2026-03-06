import { ref } from 'vue';
import BtsDialog from './BtsDialog.vue';
import BtsButton from '../BtsButton/BtsButton.vue';
import BtsText from '../BtsText/BtsText.vue';
import BtsHeading from '../BtsHeading/BtsHeading.vue';

/**
 * Modal dialog component with header, content, and footer slots.
 *
 * Uses Vue Teleport for proper z-index stacking, supports sizes (sm/md/lg),
 * scrollable content, focus trap, ESC key to close, and overlay click to close.
 *
 * **Sizes:** sm (400px), md (600px), lg (800px)
 */
export default {
  title: 'Components/Dialog',
  component: BtsDialog,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'boolean', description: 'Show/hide dialog (v-model)' },
    title: { control: 'text', description: 'Dialog title' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Dialog width size',
    },
    persistent: { control: 'boolean', description: 'Prevent close on overlay click and ESC' },
    closable: { control: 'boolean', description: 'Show close button' },
    scrollable: { control: 'boolean', description: 'Enable scrollable content area' },
  },
};

const Template = (args) => ({
  components: { BtsDialog, BtsButton },
  setup() {

    const open = ref(false);
    return { args, open };
  },
  template: `
    <div>
      <BtsButton variant="secondary" size="sm" @click="open = true">
        Open Dialog
      </BtsButton>
      <BtsDialog v-bind="args" v-model="open">
        <p>This is the dialog content. You can put any content here.</p>
      </BtsDialog>
    </div>
  `,
});

export const Default = Template.bind({});
Default.args = {
  title: 'Dialog Title',
  size: 'md',
};

export const Small = Template.bind({});
Small.args = { title: 'Small Dialog', size: 'sm' };

export const Large = Template.bind({});
Large.args = { title: 'Large Dialog', size: 'lg' };

export const WithFooter = () => ({
  components: { BtsDialog, BtsButton },
  setup() {

    const open = ref(false);
    return { open };
  },
  template: `
    <div>
      <BtsButton variant="secondary" size="sm" @click="open = true">
        Open Dialog with Footer
      </BtsButton>
      <BtsDialog v-model="open" title="Confirm Action" size="sm">
        <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
        <template #footer>
          <BtsButton variant="secondary" size="sm" @click="open = false">Cancel</BtsButton>
          <BtsButton variant="primary" size="sm" @click="open = false">Confirm</BtsButton>
        </template>
      </BtsDialog>
    </div>
  `,
});

export const Scrollable = () => ({
  components: { BtsDialog, BtsButton, BtsText },
  setup() {

    const open = ref(false);
    return { open };
  },
  template: `
    <div>
      <BtsButton variant="secondary" size="sm" @click="open = true">
        Open Scrollable Dialog
      </BtsButton>
      <BtsDialog v-model="open" title="Terms and Conditions" scrollable>
        <div v-for="i in 20" :key="i">
          <BtsText variant="body" weight="semibold" no-margin>Section {{ i }}</BtsText>
          <BtsText variant="body-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</BtsText>
        </div>
        <template #footer>
          <BtsButton variant="secondary" size="sm" @click="open = false">Decline</BtsButton>
          <BtsButton variant="primary" size="sm" @click="open = false">Accept</BtsButton>
        </template>
      </BtsDialog>
    </div>
  `,
});

export const Persistent = () => ({
  components: { BtsDialog, BtsButton },
  setup() {

    const open = ref(false);
    return { open };
  },
  template: `
    <div>
      <BtsButton variant="secondary" size="sm" @click="open = true">
        Open Persistent Dialog
      </BtsButton>
      <BtsDialog v-model="open" title="Important Notice" persistent size="sm">
        <p>This dialog can only be closed using the action buttons below. Clicking outside or pressing ESC will not close it.</p>
        <template #footer>
          <BtsButton variant="primary" size="sm" @click="open = false">I Understand</BtsButton>
        </template>
      </BtsDialog>
    </div>
  `,
});

export const CustomHeader = () => ({
  components: { BtsDialog, BtsButton, BtsHeading },
  setup() {

    const open = ref(false);
    return { open };
  },
  template: `
    <div>
      <BtsButton variant="secondary" size="sm" @click="open = true">
        Open Custom Header Dialog
      </BtsButton>
      <BtsDialog v-model="open">
        <template #header>
          <BtsHeading level="h3" no-margin>🎉 Congratulations!</BtsHeading>
        </template>
        <p>You have successfully completed the setup process.</p>
        <template #footer>
          <BtsButton variant="primary" size="sm" @click="open = false">Done</BtsButton>
        </template>
      </BtsDialog>
    </div>
  `,
});

