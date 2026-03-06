import BtsDivider from './BtsDivider.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * Divider component for separating content sections.
 *
 * Supports horizontal and vertical orientations, optional label, and line style variants.
 *
 * **Orientations:** horizontal, vertical
 * **Variants:** solid, dashed
 * **Spacing:** sm (8px), md (16px), lg (24px)
 */
export default {
  title: 'Components/Divider',
  component: BtsDivider,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the divider',
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed'],
      description: 'Line style variant',
    },
    spacing: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spacing around the divider',
    },
    label: {
      control: 'text',
      description: 'Optional label text (horizontal only)',
    },
  },
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    spacing: 'md',
    label: '',
  },
};

const Template = (args) => ({
  components: { BtsDivider },
  setup() {
    return { args };
  },
  template: '<BtsDivider v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};

export const Dashed = Template.bind({});
Dashed.args = { variant: 'dashed' };

export const WithLabel = Template.bind({});
WithLabel.args = { label: 'OR' };

export const WithLabelDashed = Template.bind({});
WithLabelDashed.args = { label: 'Section', variant: 'dashed' };

export const Vertical = () => ({
  components: { BtsDivider, BtsText },
  template: `
    <div style="display: flex; align-items: center; height: 40px;">
      <BtsText tag="span" variant="body-sm" no-margin>Item A</BtsText>
      <BtsDivider orientation="vertical" />
      <BtsText tag="span" variant="body-sm" no-margin>Item B</BtsText>
      <BtsDivider orientation="vertical" variant="dashed" />
      <BtsText tag="span" variant="body-sm" no-margin>Item C</BtsText>
    </div>
  `,
});

export const AllVariants = () => ({
  components: { BtsDivider, BtsText },
  template: `
    <div style="display: flex; flex-direction: column; gap: 0; max-width: 400px;">
      <BtsText variant="caption" color="secondary" no-margin>Solid (default)</BtsText>
      <BtsDivider />
      <BtsText variant="caption" color="secondary" no-margin>Dashed</BtsText>
      <BtsDivider variant="dashed" />
      <BtsText variant="caption" color="secondary" no-margin>With label</BtsText>
      <BtsDivider label="OR" />
      <BtsText variant="caption" color="secondary" no-margin>Dashed with label</BtsText>
      <BtsDivider variant="dashed" label="Section" />
      <BtsText variant="caption" color="secondary" no-margin>Spacing sm</BtsText>
      <BtsDivider spacing="sm" />
      <BtsText variant="caption" color="secondary" no-margin>Spacing lg</BtsText>
      <BtsDivider spacing="lg" />
    </div>
  `,
});
AllVariants.storyName = 'All Variants';

