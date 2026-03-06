import BtsTooltip from './BtsTooltip.vue';
import BtsButton from '../BtsButton/BtsButton.vue';

/**
 * Tooltip component based on Figma design
 *
 * Figma specs:
 * - Background: #000000 (black)
 * - Border: 1px #18365b
 * - Border radius: 8px
 * - Padding: 15px horizontal, 10px vertical
 * - Title (optional): Montserrat Bold 12px, white
 * - Content: Inter Regular 14px, white, line-height 20px
 * - Positions: Top (default), Right, Bottom, Left
 */
export default {
  title: 'Components/Tooltip',
  component: BtsTooltip,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text', description: 'Tooltip content (Inter 14px)' },
    title: { control: 'text', description: 'Optional title (Montserrat Bold 12px)' },
    showTitle: { control: 'boolean', description: 'Show title (according to Figma)' },
    position: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Tooltip position (according to Figma)'
    },
    delay: { control: 'number', description: 'Delay in ms' }
  }
};

const Template = (args) => ({
  components: { BtsTooltip, BtsButton },
  setup() { return { args }; },
  template: `
    <div style="padding: 100px; display: flex; justify-content: center;">
      <BtsTooltip v-bind="args">
        <BtsButton variant="secondary" size="sm">Hover me</BtsButton>
      </BtsTooltip>
    </div>
  `
});

export const Top = Template.bind({});
Top.args = { content: 'Lorem ipsum dolor sit amet consectetur.', position: 'top' };

export const Right = Template.bind({});
Right.args = { content: 'Lorem ipsum dolor sit amet consectetur.', position: 'right' };

export const Bottom = Template.bind({});
Bottom.args = { content: 'Lorem ipsum dolor sit amet consectetur.', position: 'bottom' };

export const Left = Template.bind({});
Left.args = { content: 'Lorem ipsum dolor sit amet consectetur.', position: 'left' };

export const WithTitle = Template.bind({});
WithTitle.args = {
  title: 'Title',
  showTitle: true,
  content: 'Lorem ipsum dolor sit amet consectetur.',
  position: 'top'
};
WithTitle.storyName = 'With Title';

export const AllPositions = () => ({
  components: { BtsTooltip, BtsButton },
  template: `
    <div style="padding: 120px; display: flex; gap: 48px; justify-content: center; flex-wrap: wrap;">
      <BtsTooltip content="Lorem ipsum dolor sit amet consectetur." position="top">
        <BtsButton variant="secondary" size="sm">Top</BtsButton>
      </BtsTooltip>
      <BtsTooltip content="Lorem ipsum dolor sit amet consectetur." position="right">
        <BtsButton variant="secondary" size="sm">Right</BtsButton>
      </BtsTooltip>
      <BtsTooltip content="Lorem ipsum dolor sit amet consectetur." position="bottom">
        <BtsButton variant="secondary" size="sm">Bottom</BtsButton>
      </BtsTooltip>
      <BtsTooltip content="Lorem ipsum dolor sit amet consectetur." position="left">
        <BtsButton variant="secondary" size="sm">Left</BtsButton>
      </BtsTooltip>
    </div>
  `
});
AllPositions.storyName = 'All Positions (Figma)';

