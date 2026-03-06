import BtsAvatar from './BtsAvatar.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * Avatar component for displaying user identity.
 *
 * Supports image, initials, and icon fallback.
 * Includes shape variants.
 *
 * **Sizes:** sm (32px), md (40px), lg (56px)
 * **Shapes:** circle, square
 */
export default {
  title: 'Components/Avatar',
  component: BtsAvatar,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text', description: 'Image source URL' },
    alt: { control: 'text', description: 'Alt text for image' },
    initials: { control: 'text', description: 'Initials to display (max 2 chars)' },
    icon: { control: 'text', description: 'FontAwesome icon name (fallback)' },
    iconPrefix: { control: 'text', description: 'FontAwesome icon prefix' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Avatar shape',
    },
  },
  args: {
    size: 'md',
    shape: 'circle',
  },
};

const Template = (args) => ({
  components: { BtsAvatar },
  setup() {
    return { args };
  },
  template: '<BtsAvatar v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};

export const WithImage = Template.bind({});
WithImage.args = {
  src: 'https://i.pravatar.cc/150?img=3',
  alt: 'User avatar',
};

export const WithInitials = Template.bind({});
WithInitials.args = {
  initials: 'JD',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  icon: 'user',
  iconPrefix: 'far',
};

export const Small = Template.bind({});
Small.args = { size: 'sm', initials: 'AB' };

export const Large = Template.bind({});
Large.args = { size: 'lg', initials: 'CD' };

export const SquareShape = Template.bind({});
SquareShape.args = { shape: 'square', initials: 'SQ' };

export const AllSizes = () => ({
  components: { BtsAvatar, BtsText },
  template: `
    <div style="display: flex; gap: 16px; align-items: center;">
      <div style="text-align: center;">
        <BtsAvatar initials="SM" size="sm" />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 4px;">sm (32px)</BtsText>
      </div>
      <div style="text-align: center;">
        <BtsAvatar initials="MD" size="md" />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 4px;">md (40px)</BtsText>
      </div>
      <div style="text-align: center;">
        <BtsAvatar initials="LG" size="lg" />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 4px;">lg (56px)</BtsText>
      </div>
    </div>
  `,
});

export const FallbackChain = () => ({
  components: { BtsAvatar, BtsText },
  template: `
    <div style="display: flex; gap: 16px; align-items: center;">
      <div style="text-align: center;">
        <BtsAvatar src="https://i.pravatar.cc/150?img=8" alt="User" />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 4px;">Image</BtsText>
      </div>
      <div style="text-align: center;">
        <BtsAvatar src="https://invalid-url.test/broken.jpg" initials="FB" />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 4px;">Image error → Initials</BtsText>
      </div>
      <div style="text-align: center;">
        <BtsAvatar />
        <BtsText variant="caption" color="secondary" no-margin style="margin-top: 4px;">Icon (default)</BtsText>
      </div>
    </div>
  `,
});

