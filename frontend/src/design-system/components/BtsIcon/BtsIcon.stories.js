import BtsIcon from './BtsIcon.vue';
import BtsText from '../BtsText/BtsText.vue';
import BtsHeading from '../BtsHeading/BtsHeading.vue';

/**
 * Icon component using Font Awesome
 *
 * **Specs:**
 * - Sizes: sm (16px), default (24px), lg (32px)
 * - Color: #555555 (default)
 * - Uses Font Awesome icons
 *
 * **Prefixes:**
 * - `far` - Regular (default)
 * - `fas` - Solid
 * - `fab` - Brands
 * - `fal` - Light
 * - `fad` - Duotone
 */
export default {
  title: 'Components/Icon',
  component: BtsIcon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Font Awesome icon name (without fa- prefix)',
    },
    prefix: {
      control: 'select',
      options: ['far', 'fas', 'fab', 'fal', 'fad'],
      description: 'Font Awesome prefix (far=regular, fas=solid, fab=brands)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Icon size',
    },
    color: {
      control: 'color',
      description: 'Icon color (default: #555555)',
    },
  },
};

const Template = (args) => ({
  components: { BtsIcon },
  setup() { return { args }; },
  template: '<BtsIcon v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = { name: 'user' };

export const Solid = Template.bind({});
Solid.args = { name: 'user', prefix: 'fas' };

export const Sizes = () => ({
  components: { BtsIcon, BtsText },
  template: `
    <div style="display: flex; gap: 24px; align-items: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <BtsIcon name="user" size="sm" />
        <BtsText tag="span" variant="caption" color="secondary" no-margin>sm (16px)</BtsText>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <BtsIcon name="user" size="md" />
        <BtsText tag="span" variant="caption" color="secondary" no-margin>md (24px)</BtsText>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <BtsIcon name="user" size="lg" />
        <BtsText tag="span" variant="caption" color="secondary" no-margin>lg (32px)</BtsText>
      </div>
    </div>
  `,
});

export const AllRegisteredIcons = () => ({
  components: { BtsIcon, BtsText, BtsHeading },
  template: `
    <div>
      <BtsHeading level="h3" no-margin style="margin-bottom: 16px;">Registered Icons (FontAwesome Pro) - Regular (far)</BtsHeading>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px;">
        <div v-for="icon in icons" :key="icon" style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
          <BtsIcon :name="icon" />
          <BtsText tag="span" variant="caption" color="secondary" no-margin style="font-family: monospace; word-break: break-all; text-align: center;">{{ icon }}</BtsText>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      icons: [
        // Navigation and Interface
        'house', 'clock', 'timeline', 'folder', 'folder-open', 'circle-question',
        'magnifying-glass', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down',
        'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right', 'gear', 'bars',
        'gauge-high', 'list-check', 'arrows-rotate', 'bars-staggered',

        // Users and People
        'user', 'users', 'user-plus', 'circle-user', 'headset', 'handshake', 'user-magnifying-glass',

        // Business and Structures
        'building', 'briefcase', 'gavel', 'landmark', 'chart-column', 'chart-line', 'chart-pie', 'chart-bar',
        'dollar-sign', 'book', 'shield-halved', 'calculator', 'robot', 'scale-balanced',

        // Documents and Files
        'file', 'file-lines', 'clipboard-list', 'paperclip', 'cloud-arrow-up', 'file-arrow-up',
        'inbox', 'box-archive', 'box-open', 'tag', 'list', 'envelope-open', 'download',
        'file-pdf', 'file-image', 'file-zipper',

        // Actions and Operations
        'plus', 'circle-plus', 'pen', 'trash', 'floppy-disk', 'rotate', 'xmark',
        'trash-can', 'check', 'clipboard-check', 'paper-plane', 'eye', 'eye-slash',
        'link', 'right-left', 'circle-check', 'circle-xmark', 'triangle-exclamation',
        'circle-info', 'upload', 'copy', 'sort', 'arrows-left-right',

        // Status and Feedback
        'calendar', 'bell', 'lightbulb', 'calendar-check', 'clock-rotate-left',

        // Security and Access
        'lock', 'lock-open', 'ban', 'arrow-right-from-bracket', 'globe',

        // Communication
        'envelope', 'phone', 'language', 'comment',

        // Media and Content
        'play', 'circle-play', 'graduation-cap', 'arrow-up-right-from-square', 'school',

        // Text Formatting
        'bold', 'italic', 'list-ul', 'list-ol', 'heading',

        // Proposals and Contracts
        'file-contract', 'pen-to-square', 'truck',

        // Others
        'filter', 'percent', 'cloud-slash', 'arrow-trend-up', 'arrow-trend-down'
      ]
    };
  }
});
AllRegisteredIcons.storyName = 'All Registered Icons';
