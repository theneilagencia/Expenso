import BtsHeading from './BtsHeading.vue';
import BtsText from '../BtsText/BtsText.vue';

export default {
  title: 'Components/Typography/Heading',
  component: BtsHeading,
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '1', '2', '3', '4', '5', '6'],
      description: 'Semantic heading level (h1-h6)',
      table: {
        type: { summary: 'string | number' },
        defaultValue: { summary: 'h2' },
      },
    },
    variant: {
      control: 'select',
      options: [null, 'display-xl', 'display-lg', 'h1', 'h2', 'h3', 'h4'],
      description: 'Visual style (can differ from semantic level)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'null (uses level)' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'inverse'],
      description: 'Text color',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Text alignment',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'left' },
      },
    },
    weight: {
      control: 'select',
      options: [null, 'thin', 'light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
      description: 'Font weight (overrides default)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'null' },
      },
    },
    noMargin: {
      control: 'boolean',
      description: 'Removes default margin',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    default: {
      control: 'text',
      description: 'Heading content',
      table: {
        type: { summary: 'slot' },
      },
    },
  },
};

const Template = (args) => ({
  components: { BtsHeading },
  setup() {
    return { args };
  },
  template: '<BtsHeading v-bind="args">{{ args.default || "Heading Text" }}</BtsHeading>',
});

// ============================================
// STORIES - Display Styles
// ============================================

export const DisplayXL = Template.bind({});
DisplayXL.args = {
  variant: 'display-xl',
  level: 'h1',
  default: 'BTS Global Corp',
};

export const DisplayLG = Template.bind({});
DisplayLG.args = {
  variant: 'display-lg',
  level: 'h1',
  default: 'Sophisticated corporate solutions',
};

// ============================================
// STORIES - Heading Levels
// ============================================

export const Heading1 = Template.bind({});
Heading1.args = {
  level: 'h1',
  default: 'Heading 1 - Main Title',
};

export const Heading2 = Template.bind({});
Heading2.args = {
  level: 'h2',
  default: 'Heading 2 - Subtitle',
};

export const Heading3 = Template.bind({});
Heading3.args = {
  level: 'h3',
  default: 'Heading 3 - Section',
};

export const Heading4 = Template.bind({});
Heading4.args = {
  level: 'h4',
  default: 'Heading 4 - Subsection',
};

export const Heading5 = Template.bind({});
Heading5.args = {
  level: 'h5',
  default: 'Heading 5 - Smaller Title',
};

export const Heading6 = Template.bind({});
Heading6.args = {
  level: 'h6',
  default: 'Heading 6 - Smallest Title',
};

// ============================================
// STORIES - Colors
// ============================================

export const ColorVariants = () => ({
  components: { BtsHeading },
  template: `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <BtsHeading level="h2" color="primary">Primary Color (BTS Blue)</BtsHeading>
      </div>
      <div>
        <BtsHeading level="h2" color="secondary">Secondary Color (Dark Gray)</BtsHeading>
      </div>
      <div>
        <BtsHeading level="h2" color="tertiary">Tertiary Color (Medium Gray)</BtsHeading>
      </div>
      <div style="background: #1B3857; padding: 16px; border-radius: 8px;">
        <BtsHeading level="h2" color="inverse">Inverse Color (White)</BtsHeading>
      </div>
    </div>
  `,
});

// ============================================
// STORIES - Alignment
// ============================================

export const Alignment = () => ({
  components: { BtsHeading },
  template: `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <BtsHeading level="h2" align="left">Left Aligned</BtsHeading>
      <BtsHeading level="h2" align="center">Centered</BtsHeading>
      <BtsHeading level="h2" align="right">Right Aligned</BtsHeading>
    </div>
  `,
});

// ============================================
// STORIES - Weight Variations
// ============================================

export const WeightVariations = () => ({
  components: { BtsHeading },
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <BtsHeading level="h2" weight="light">Light Weight (300)</BtsHeading>
      <BtsHeading level="h2" weight="regular">Regular Weight (400)</BtsHeading>
      <BtsHeading level="h2" weight="medium">Medium Weight (500)</BtsHeading>
      <BtsHeading level="h2" weight="semibold">Semibold Weight (600)</BtsHeading>
      <BtsHeading level="h2" weight="bold">Bold Weight (700)</BtsHeading>
      <BtsHeading level="h2" weight="black">Black Weight (900)</BtsHeading>
    </div>
  `,
});

// ============================================
// STORIES - Complete Showcase
// ============================================

export const AllHeadings = () => ({
  components: { BtsHeading, BtsText },
  template: `
    <div style="display: flex; flex-direction: column; gap: 32px; max-width: 800px;">
      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace;">
          variant="display-xl" level="h1" (56px / Bold)
        </BtsText>
        <BtsHeading variant="display-xl" level="h1">
          BTS Global Corp
        </BtsHeading>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace;">
          variant="display-lg" level="h1" (48px / Bold)
        </BtsText>
        <BtsHeading variant="display-lg" level="h1">
          Sophisticated corporate solutions
        </BtsHeading>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace;">
          level="h1"
        </BtsText>
        <BtsHeading level="h1">Our Mission</BtsHeading>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace;">
          level="h2"
        </BtsText>
        <BtsHeading level="h2">Our Values</BtsHeading>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace;">
          level="h3"
        </BtsText>
        <BtsHeading level="h3">Principles that guide our work</BtsHeading>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace;">
          level="h4"
        </BtsText>
        <BtsHeading level="h4">Excellence in everything we do</BtsHeading>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace;">
          level="h5"
        </BtsText>
        <BtsHeading level="h5">Transparency and clear communication</BtsHeading>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace;">
          level="h6"
        </BtsText>
        <BtsHeading level="h6">Constant innovation</BtsHeading>
      </div>
    </div>
  `,
});

// ============================================
// STORIES - Semantic vs Visual
// ============================================

export const SemanticVsVisual = () => ({
  components: { BtsHeading, BtsText },
  template: `
    <div style="display: flex; flex-direction: column; gap: 32px; max-width: 800px;">
      <div>
        <BtsText color="secondary" style="margin-bottom: 16px;">
          <strong>Example:</strong> Semantic H2 with Display XL visual
        </BtsText>
        <BtsHeading level="h2" variant="display-xl">
          H2 heading with large visual
        </BtsHeading>
        <BtsText variant="body-sm" color="tertiary" style="margin-top: 8px;">
          Useful for SEO: keeps semantic hierarchy but adjusts visual
        </BtsText>
      </div>

      <div>
        <BtsText color="secondary" style="margin-bottom: 16px;">
          <strong>Example:</strong> Semantic H1 with H3 visual
        </BtsText>
        <BtsHeading level="h1" variant="h3">
          H1 heading with smaller visual
        </BtsHeading>
        <BtsText variant="body-sm" color="tertiary" style="margin-top: 8px;">
          Useful when you need H1 for SEO but smaller visual
        </BtsText>
      </div>
    </div>
  `,
});

