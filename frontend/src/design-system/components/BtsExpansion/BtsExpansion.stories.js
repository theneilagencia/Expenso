import { ref } from 'vue';
import BtsExpansion from './BtsExpansion.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * Expandable/collapsible panel component (accordion).
 *
 * Supports v-model for open/close state, title/subtitle props, header slot,
 * disabled state, and smooth height animation.
 *
 * Stack multiple panels for accordion behavior — control which is open via parent state.
 *
 * **Features:** v-model, header slot, disabled, animated expand/collapse
 */
export default {
  title: 'Components/Expansion',
  component: BtsExpansion,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'boolean', description: 'Whether the panel is expanded' },
    title: { control: 'text', description: 'Panel header title' },
    subtitle: { control: 'text', description: 'Panel header subtitle' },
    disabled: { control: 'boolean', description: 'Disable expand/collapse' },
  },
  args: {
    modelValue: false,
    title: 'Expansion Panel',
    subtitle: '',
    disabled: false,
  },
};

const Template = (args) => ({
  components: { BtsExpansion },
  setup() {
    const open = ref(args.modelValue);
    return { args, open };
  },
  template: `
    <BtsExpansion v-bind="args" v-model="open">
      <p>This is the expandable content. It can contain any HTML or Vue components.</p>
    </BtsExpansion>
  `,
});

export const Default = Template.bind({});
Default.args = { title: 'Click to expand' };

export const OpenByDefault = Template.bind({});
OpenByDefault.args = { title: 'Already open', modelValue: true };

export const WithSubtitle = Template.bind({});
WithSubtitle.args = { title: 'Panel Title', subtitle: 'Additional description text' };

export const Disabled = Template.bind({});
Disabled.args = { title: 'Disabled Panel', disabled: true };

export const CustomHeader = (args) => ({
  components: { BtsExpansion, BtsText },
  setup() {
    const open = ref(false);
    return { args, open };
  },
  template: `
    <BtsExpansion v-model="open">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
          <BtsText tag="span" variant="body-sm" weight="semibold" no-margin>Custom Header with Status</BtsText>
        </div>
      </template>
      <p>Content with a custom header slot.</p>
    </BtsExpansion>
  `,
});

export const AccordionSingle = () => ({
  components: { BtsExpansion },
  setup() {
    const openIndex = ref(0);
    function togglePanel(index) {
      openIndex.value = openIndex.value === index ? -1 : index;
    }
    return { openIndex, togglePanel };
  },
  template: `
    <div>
      <BtsExpansion
        title="Section 1 — Personal Info"
        :modelValue="openIndex === 0"
        @update:modelValue="togglePanel(0)"
      >
        <p>Name, email, phone number and other personal details.</p>
      </BtsExpansion>
      <BtsExpansion
        title="Section 2 — Address"
        :modelValue="openIndex === 1"
        @update:modelValue="togglePanel(1)"
      >
        <p>Street, city, state, zip code and country information.</p>
      </BtsExpansion>
      <BtsExpansion
        title="Section 3 — Preferences"
        :modelValue="openIndex === 2"
        @update:modelValue="togglePanel(2)"
      >
        <p>Notification settings, language, and theme preferences.</p>
      </BtsExpansion>
    </div>
  `,
});
AccordionSingle.storyName = 'Accordion (Single Expand)';

export const AccordionMultiple = () => ({
  components: { BtsExpansion },
  setup() {
    const panels = ref([true, false, false]);
    function togglePanel(index) {
      panels.value[index] = !panels.value[index];
    }
    return { panels, togglePanel };
  },
  template: `
    <div>
      <BtsExpansion
        title="Section 1 — Overview"
        :modelValue="panels[0]"
        @update:modelValue="togglePanel(0)"
      >
        <p>General overview and summary information.</p>
      </BtsExpansion>
      <BtsExpansion
        title="Section 2 — Details"
        :modelValue="panels[1]"
        @update:modelValue="togglePanel(1)"
      >
        <p>Detailed breakdown of all items and configurations.</p>
      </BtsExpansion>
      <BtsExpansion
        title="Section 3 — History"
        :modelValue="panels[2]"
        @update:modelValue="togglePanel(2)"
      >
        <p>Change log and historical data records.</p>
      </BtsExpansion>
    </div>
  `,
});
AccordionMultiple.storyName = 'Accordion (Multiple Expand)';

