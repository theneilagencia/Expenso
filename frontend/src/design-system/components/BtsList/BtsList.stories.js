import { ref } from 'vue';
import BtsList from './BtsList.vue';
import BtsListItem from './BtsListItem.vue';
import BtsAvatar from '../BtsAvatar/BtsAvatar.vue';
import BtsText from '../BtsText/BtsText.vue';

/**
 * List container and list item components.
 *
 * BtsList provides the container with optional dividers and dense mode.
 * BtsListItem supports clickable, selected, disabled states, and leading/trailing slots.
 *
 * **Features:** dividers, dense mode, selection, leading/trailing slots, keyboard accessible
 */
export default {
  title: 'Components/List',
  component: BtsList,
  subcomponents: { BtsListItem },
  tags: ['autodocs'],
  argTypes: {
    dividers: { control: 'boolean', description: 'Show dividers between items' },
    dense: { control: 'boolean', description: 'Reduce item padding' },
  },
  args: {
    dividers: false,
    dense: false,
  },
};

export const Default = () => ({
  components: { BtsList, BtsListItem },
  template: `
    <BtsList style="max-width: 360px;">
      <BtsListItem>Item 1</BtsListItem>
      <BtsListItem>Item 2</BtsListItem>
      <BtsListItem>Item 3</BtsListItem>
    </BtsList>
  `,
});

export const WithDividers = () => ({
  components: { BtsList, BtsListItem },
  template: `
    <BtsList dividers style="max-width: 360px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <BtsListItem>Dashboard</BtsListItem>
      <BtsListItem>Settings</BtsListItem>
      <BtsListItem>Profile</BtsListItem>
    </BtsList>
  `,
});

export const Dense = () => ({
  components: { BtsList, BtsListItem },
  template: `
    <BtsList dense dividers style="max-width: 360px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <BtsListItem>Compact Item 1</BtsListItem>
      <BtsListItem>Compact Item 2</BtsListItem>
      <BtsListItem>Compact Item 3</BtsListItem>
      <BtsListItem>Compact Item 4</BtsListItem>
    </BtsList>
  `,
});

export const Clickable = () => ({
  components: { BtsList, BtsListItem },
  setup() {
    const selected = ref(1);
    return { selected };
  },
  template: `
    <BtsList dividers style="max-width: 360px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <BtsListItem clickable :selected="selected === 0" @click="selected = 0">Dashboard</BtsListItem>
      <BtsListItem clickable :selected="selected === 1" @click="selected = 1">Analytics</BtsListItem>
      <BtsListItem clickable :selected="selected === 2" @click="selected = 2">Reports</BtsListItem>
      <BtsListItem clickable disabled>Archived (disabled)</BtsListItem>
    </BtsList>
  `,
});

export const WithSecondaryText = () => ({
  components: { BtsList, BtsListItem },
  template: `
    <BtsList dividers style="max-width: 400px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <BtsListItem clickable secondary="john@example.com">John Doe</BtsListItem>
      <BtsListItem clickable secondary="jane@example.com">Jane Smith</BtsListItem>
      <BtsListItem clickable secondary="bob@example.com">Bob Johnson</BtsListItem>
    </BtsList>
  `,
});

export const WithLeadingAndTrailing = () => ({
  components: { BtsList, BtsListItem, BtsAvatar, BtsText },
  template: `
    <BtsList dividers style="max-width: 400px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <BtsListItem clickable secondary="3 new messages">
        <template #leading>
          <BtsAvatar initials="JD" size="sm" />
        </template>
        John Doe
        <template #trailing>
          <BtsText tag="span" variant="caption" color="tertiary" no-margin>2m ago</BtsText>
        </template>
      </BtsListItem>
      <BtsListItem clickable secondary="Sent a document">
        <template #leading>
          <BtsAvatar initials="JS" size="sm" />
        </template>
        Jane Smith
        <template #trailing>
          <BtsText tag="span" variant="caption" color="tertiary" no-margin>1h ago</BtsText>
        </template>
      </BtsListItem>
      <BtsListItem clickable secondary="Updated profile">
        <template #leading>
          <BtsAvatar initials="BJ" size="sm" />
        </template>
        Bob Johnson
        <template #trailing>
          <BtsText tag="span" variant="caption" color="tertiary" no-margin>3h ago</BtsText>
        </template>
      </BtsListItem>
    </BtsList>
  `,
});

