import BtsStatusIcon from './BtsStatusIcon.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * StatusIcon component based on Figma design.
 *
 * **Figma specs:**
 * - Container size: 32x32px
 * - Icon size: 26x26px
 * - All icons are circular
 *
 * **Colors:**
 * - Info: #185AB4
 * - Success: #1B9B45
 * - Warning: #DB9814
 * - Danger: #DB242A
 */
export default {
  title: 'Components/StatusIcon',
  component: BtsStatusIcon,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
      description: 'Status variant - determines icon and color'
    }
  }
};

const Template = (args) => ({
  components: { BtsStatusIcon },
  setup() { return { args }; },
  template: '<BtsStatusIcon v-bind="args" />'
});

export const Info = Template.bind({});
Info.args = { variant: 'info' };

export const Success = Template.bind({});
Success.args = { variant: 'success' };

export const Warning = Template.bind({});
Warning.args = { variant: 'warning' };

export const Danger = Template.bind({});
Danger.args = { variant: 'danger' };

export const AllVariants = () => ({
  components: { BtsStatusIcon, BtsText },
  template: `
    <div style="display: flex; gap: 24px; align-items: center;">
      <div style="text-align: center;">
        <BtsStatusIcon variant="info" />
        <BtsText variant="caption" no-margin style="margin-top: 8px;">Info</BtsText>
      </div>
      <div style="text-align: center;">
        <BtsStatusIcon variant="success" />
        <BtsText variant="caption" no-margin style="margin-top: 8px;">Success</BtsText>
      </div>
      <div style="text-align: center;">
        <BtsStatusIcon variant="warning" />
        <BtsText variant="caption" no-margin style="margin-top: 8px;">Warning</BtsText>
      </div>
      <div style="text-align: center;">
        <BtsStatusIcon variant="danger" />
        <BtsText variant="caption" no-margin style="margin-top: 8px;">Danger</BtsText>
      </div>
    </div>
  `
});

