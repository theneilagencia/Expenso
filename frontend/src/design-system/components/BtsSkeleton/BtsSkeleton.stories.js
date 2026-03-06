import BtsSkeleton from './BtsSkeleton.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * Skeleton placeholder component for loading states.
 *
 * Use to show content placeholders while data is loading.
 *
 * **Variants:** text (single line), circle (avatar), rectangle (card/image)
 */
export default {
  title: 'Components/Skeleton',
  component: BtsSkeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circle', 'rectangle'],
      description: 'Shape variant of the skeleton',
    },
    width: {
      control: 'text',
      description: 'Custom width (CSS value)',
    },
    height: {
      control: 'text',
      description: 'Custom height (CSS value)',
    },
    borderRadius: {
      control: 'text',
      description: 'Custom border radius (CSS value)',
    },
    animate: {
      control: 'boolean',
      description: 'Enable shimmer animation',
    },
  },
  args: {
    variant: 'text',
    width: '',
    height: '',
    borderRadius: '',
    animate: true,
  },
};

const Template = (args) => ({
  components: { BtsSkeleton },
  setup() {
    return { args };
  },
  template: '<BtsSkeleton v-bind="args" />',
});

export const Text = Template.bind({});
Text.args = { variant: 'text' };

export const Circle = Template.bind({});
Circle.args = { variant: 'circle' };

export const Rectangle = Template.bind({});
Rectangle.args = { variant: 'rectangle' };

export const CustomSize = Template.bind({});
CustomSize.args = {
  variant: 'rectangle',
  width: '200px',
  height: '80px',
  borderRadius: '16px',
};

export const NoAnimation = Template.bind({});
NoAnimation.args = {
  variant: 'text',
  animate: false,
};

export const AllVariants = () => ({
  components: { BtsSkeleton, BtsText },
  template: `
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <div>
        <BtsText variant="caption" color="secondary" weight="medium" no-margin style="margin-bottom: 8px;">text</BtsText>
        <BtsSkeleton variant="text" />
      </div>
      <div>
        <BtsText variant="caption" color="secondary" weight="medium" no-margin style="margin-bottom: 8px;">circle</BtsText>
        <BtsSkeleton variant="circle" />
      </div>
      <div>
        <BtsText variant="caption" color="secondary" weight="medium" no-margin style="margin-bottom: 8px;">rectangle</BtsText>
        <BtsSkeleton variant="rectangle" />
      </div>
    </div>
  `,
});
AllVariants.storyName = 'All Variants';

export const CardPlaceholder = () => ({
  components: { BtsSkeleton },
  template: `
    <div style="max-width: 320px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <BtsSkeleton variant="rectangle" height="160px" />
      <div style="display: flex; align-items: center; gap: 12px; margin-top: 16px;">
        <BtsSkeleton variant="circle" width="40px" height="40px" />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <BtsSkeleton variant="text" width="60%" />
          <BtsSkeleton variant="text" width="40%" height="12px" />
        </div>
      </div>
      <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
        <BtsSkeleton variant="text" />
        <BtsSkeleton variant="text" />
        <BtsSkeleton variant="text" width="75%" />
      </div>
    </div>
  `,
});
CardPlaceholder.storyName = 'Card Placeholder';

export const ListPlaceholder = () => ({
  components: { BtsSkeleton },
  template: `
    <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
      <div v-for="i in 4" :key="i" style="display: flex; align-items: center; gap: 12px;">
        <BtsSkeleton variant="circle" width="36px" height="36px" />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
          <BtsSkeleton variant="text" width="70%" />
          <BtsSkeleton variant="text" width="45%" height="12px" />
        </div>
      </div>
    </div>
  `,
});
ListPlaceholder.storyName = 'List Placeholder';

