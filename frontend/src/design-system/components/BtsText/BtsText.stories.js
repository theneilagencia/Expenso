import BtsText from './BtsText.vue';

export default {
  title: 'Components/Typography/Text',
  component: BtsText,
  tags: ['autodocs'],
  argTypes: {
    tag: {
      control: 'select',
      options: ['p', 'span', 'div', 'label'],
      description: 'HTML tag to render',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'p' },
      },
    },
    variant: {
      control: 'select',
      options: ['subtitle', 'body', 'body-sm', 'caption'],
      description: 'Typographic variant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'body' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'disabled', 'inverse', 'link'],
      description: 'Text color',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'left' },
      },
    },
    weight: {
      control: 'select',
      options: [null, 'thin', 'light', 'regular', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
      description: 'Font weight',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'null' },
      },
    },
    italic: {
      control: 'boolean',
      description: 'Italic style',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    underline: {
      control: 'boolean',
      description: 'Underlined text',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    uppercase: {
      control: 'boolean',
      description: 'Uppercase text',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    lineClamp: {
      control: 'number',
      description: 'Limit number of lines',
      table: {
        type: { summary: 'number' },
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
      description: 'Text content',
      table: {
        type: { summary: 'slot' },
      },
    },
  },
};

const Template = (args) => ({
  components: { BtsText },
  setup() {
    return { args };
  },
  template: '<BtsText v-bind="args">{{ args.default || "Text content" }}</BtsText>',
});

// ============================================
// STORIES - Variants
// ============================================

export const Subtitle = Template.bind({});
Subtitle.args = {
  variant: 'subtitle',
  default: 'Principles that guide our daily work',
};

export const Body = Template.bind({});
Body.args = {
  variant: 'body',
  default: 'BTS Global Corp exists to free entrepreneurs and families from jurisdictional barriers, offering a unique and simple platform.',
};

export const BodySmall = Template.bind({});
BodySmall.args = {
  variant: 'body-sm',
  default: 'Additional information about the company and its services. Secondary text for additional details.',
};

export const Caption = Template.bind({});
Caption.args = {
  variant: 'caption',
  default: '© 2024 BTS GLOBAL CORP. ALL RIGHTS RESERVED.',
};

// ============================================
// STORIES - Colors
// ============================================

export const ColorVariants = () => ({
  components: { BtsText },
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <BtsText color="primary">Primary Color - Main text (black)</BtsText>
      <BtsText color="secondary">Secondary Color - Secondary text (dark gray)</BtsText>
      <BtsText color="tertiary">Tertiary Color - Tertiary text (medium gray)</BtsText>
      <BtsText color="disabled">Disabled Color - Disabled text (light gray)</BtsText>
      <div style="background: #1B3857; padding: 16px; border-radius: 8px;">
        <BtsText color="inverse">Inverse Color - Inverse text (white)</BtsText>
      </div>
      <BtsText color="link">Link Color - Link text (highlight blue)</BtsText>
    </div>
  `,
});

// ============================================
// STORIES - Modifiers
// ============================================

export const TextModifiers = () => ({
  components: { BtsText },
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <BtsText>Normal text</BtsText>
      <BtsText italic>Italic text</BtsText>
      <BtsText underline>Underlined text</BtsText>
      <BtsText uppercase>Uppercase text</BtsText>
      <BtsText weight="bold">Bold text</BtsText>
      <BtsText weight="light">Light text</BtsText>
      <div style="max-width: 300px;">
        <BtsText truncate>
          This is a very long text that will be truncated with ellipsis when it exceeds the available width limit
        </BtsText>
      </div>
    </div>
  `,
});

// ============================================
// STORIES - Line Clamp
// ============================================

export const LineClamp = () => ({
  components: { BtsText },
  template: `
    <div style="display: flex; flex-direction: column; gap: 32px; max-width: 400px;">
      <div>
        <BtsText variant="caption" color="secondary" no-margin style="margin-bottom: 8px;">Line Clamp: 2 lines</BtsText>
        <BtsText :line-clamp="2">
          BTS Global Corp exists to free entrepreneurs and families from jurisdictional barriers,
          offering a unique and simple platform that combines strategic planning, international structures,
          banking services and wealth management with the rigor of a global private office.
        </BtsText>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="margin-bottom: 8px;">Line Clamp: 3 lines</BtsText>
        <BtsText :line-clamp="3">
          BTS Global Corp exists to free entrepreneurs and families from jurisdictional barriers,
          offering a unique and simple platform that combines strategic planning, international structures,
          banking services and wealth management with the rigor of a global private office.
        </BtsText>
      </div>
    </div>
  `,
});

// ============================================
// STORIES - Alignment
// ============================================

export const Alignment = () => ({
  components: { BtsText },
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <BtsText align="left">Left aligned text</BtsText>
      <BtsText align="center">Centered text</BtsText>
      <BtsText align="right">Right aligned text</BtsText>
      <BtsText align="justify">
        Justified text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </BtsText>
    </div>
  `,
});

// ============================================
// STORIES - All Variants Showcase
// ============================================

export const AllVariants = () => ({
  components: { BtsText },
  template: `
    <div style="display: flex; flex-direction: column; gap: 32px; max-width: 800px;">
      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace; margin-bottom: 8px;">
          variant="subtitle" (18px / Medium)
        </BtsText>
        <BtsText variant="subtitle">
          Principles that guide our daily work
        </BtsText>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace; margin-bottom: 8px;">
          variant="body" (16px / Regular) - DEFAULT
        </BtsText>
        <BtsText variant="body">
          BTS Global Corp exists to free entrepreneurs and families from jurisdictional barriers,
          offering a unique and simple platform that combines strategic planning, international structures,
          banking services and wealth management.
        </BtsText>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace; margin-bottom: 8px;">
          variant="body-sm" (14px / Regular)
        </BtsText>
        <BtsText variant="body-sm">
          Additional information about the company and its services. Secondary text for additional details.
        </BtsText>
      </div>

      <div>
        <BtsText variant="caption" color="secondary" no-margin style="font-family: monospace; margin-bottom: 8px;">
          variant="caption" (12px / Regular)
        </BtsText>
        <BtsText variant="caption">
          © 2024 BTS GLOBAL CORP. ALL RIGHTS RESERVED.
        </BtsText>
      </div>
    </div>
  `,
});

// ============================================
// STORIES - Real World Example
// ============================================

export const RealWorldExample = () => ({
  components: { BtsText },
  template: `
    <div style="max-width: 600px; padding: 24px; background: white; border-radius: 12px; border: 1px solid #E4E4E4;">
      <BtsText variant="subtitle" no-margin>
        Our Mission
      </BtsText>

      <BtsText variant="body" style="margin-top: 16px;">
        BTS Global Corp exists to <BtsText tag="span" weight="bold">free entrepreneurs and families</BtsText>
        from jurisdictional barriers, offering a unique and simple platform that combines strategic planning,
        international structures, banking services and wealth management.
      </BtsText>

      <BtsText variant="body">
        With the rigor of a global private office, we ensure <BtsText tag="span" weight="bold">security,
        freedom and legacy continuity</BtsText> for our clients.
      </BtsText>

      <BtsText variant="body-sm" color="secondary" style="margin-top: 24px;">
        Additional information about our services and how we can help you achieve your goals.
      </BtsText>

      <BtsText variant="caption" color="tertiary" style="margin-top: 32px;" no-margin>
        © 2024 BTS GLOBAL CORP. ALL RIGHTS RESERVED.
      </BtsText>
    </div>
  `,
});

