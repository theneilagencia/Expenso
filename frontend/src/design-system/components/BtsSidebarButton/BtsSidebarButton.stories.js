import BtsSidebarButton from './BtsSidebarButton.vue';
import BtsSidebar from '../BtsSidebar/BtsSidebar.vue';

/**
 * SidebarButton - Navigation button for sidebar based on Figma design.
 *
 * **Figma specs:**
 * - Width Expanded: 208px (full width)
 * - Width Collapsed: 44px (icon only)
 * - Height: 40px
 * - Border-radius: 8px
 * - Padding: 12px horizontal
 * - Gap: 12px between icon and label
 *
 * **States:**
 * - Default: transparent background
 * - Hover: background #c6c6c6
 * - Selected: background #006394
 *
 * **Typography:**
 * - Icon: Font Awesome Light 16px, color #ffffff
 * - Label: Inter Medium 14px, letter-spacing -0.28px, color #ffffff
 */
export default {
  title: 'Components/SidebarButton',
  component: BtsSidebarButton,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Button label text' },
    icon: { control: 'text', description: 'Font Awesome icon name (without fa-)' },
    iconPrefix: {
      control: 'select',
      options: ['far', 'fas', 'fal'],
      description: 'Font Awesome prefix (far=regular, fas=solid, fal=light)',
    },
    selected: { control: 'boolean', description: 'Selected state' },
    collapsed: { control: 'boolean', description: 'Collapsed state (icon only)' },
    href: { control: 'text', description: 'Link href (renders as <a>)' },
    expandable: { control: 'boolean', description: 'Shows chevron for expandable menus' },
    expanded: { control: 'boolean', description: 'Expanded state for expandable menus' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Visual variant',
    },
  },
};

const SidebarDecorator = (story) => ({
  components: { BtsSidebar, story },
  template: `
    <BtsSidebar :toggleable="false" :showAvatar="false" companyName="Demo" style="min-height: 200px; height: auto;">
      <template #navigation>
        <story />
      </template>
    </BtsSidebar>
  `,
});

export const Default = {
  decorators: [SidebarDecorator],
  args: {
    label: 'Dashboard',
    icon: 'house',
  },
};

export const Selected = {
  decorators: [SidebarDecorator],
  args: {
    label: 'Proposals',
    icon: 'file',
    selected: true,
  },
};

export const CollapsedState = {
  decorators: [SidebarDecorator],
  args: {
    label: 'Dashboard',
    icon: 'house',
    collapsed: true,
  },
};

export const CollapsedSelected = {
  decorators: [SidebarDecorator],
  args: {
    label: 'Proposals',
    icon: 'file',
    selected: true,
    collapsed: true,
  },
};

export const Expandable = {
  decorators: [SidebarDecorator],
  args: {
    label: 'Settings',
    icon: 'gear',
    expandable: true,
    expanded: false,
  },
};

export const ExpandableWithSubmenu = {
  render: () => ({
    components: { BtsSidebarButton, BtsSidebar },
    template: `
      <BtsSidebar :toggleable="false" :showAvatar="false" companyName="Demo" style="min-height: 300px; height: auto;">
        <template #navigation>
          <BtsSidebarButton
            label="Settings"
            icon="gear"
            expandable
            :expanded="expanded"
            @toggle="expanded = $event"
          >
            <template #submenu>
              <BtsSidebarButton label="Profile" icon="user" />
              <BtsSidebarButton label="Security" icon="lock" />
              <BtsSidebarButton label="Notifications" icon="bell" selected />
              <BtsSidebarButton label="Privacy" icon="shield" />
            </template>
          </BtsSidebarButton>
        </template>
      </BtsSidebar>
    `,
    data() {
      return { expanded: true };
    },
  }),
};

export const MultipleExpandable = {
  render: () => ({
    components: { BtsSidebarButton, BtsSidebar },
    template: `
      <BtsSidebar :toggleable="false" :showAvatar="false" companyName="Demo" style="min-height: 400px; height: auto;">
        <template #navigation>
          <BtsSidebarButton label="Dashboard" icon="house" />

          <BtsSidebarButton
            label="Clients"
            icon="user"
            expandable
            :expanded="expandedClients"
            @toggle="expandedClients = $event"
          >
            <template #submenu>
              <BtsSidebarButton label="All" icon="users" />
              <BtsSidebarButton label="Active" icon="circle-check" selected />
              <BtsSidebarButton label="Inactive" icon="circle-xmark" />
            </template>
          </BtsSidebarButton>

          <BtsSidebarButton
            label="Settings"
            icon="gear"
            expandable
            :expanded="expandedSettings"
            @toggle="expandedSettings = $event"
          >
            <template #submenu>
              <BtsSidebarButton label="Profile" icon="user" />
              <BtsSidebarButton label="Security" icon="lock" />
              <BtsSidebarButton label="Notifications" icon="bell" />
            </template>
          </BtsSidebarButton>

          <BtsSidebarButton label="Help" icon="circle-question" />
        </template>
      </BtsSidebar>
    `,
    data() {
      return {
        expandedClients: true,
        expandedSettings: false,
      };
    },
  }),
};

export const AllStates = {
  render: () => ({
    components: { BtsSidebarButton, BtsSidebar },
    template: `
      <div style="display: flex; gap: 40px;">
        <BtsSidebar :toggleable="false" :showAvatar="false" companyName="Expanded" style="min-height: 400px; height: auto;">
          <template #navigation>
            <BtsSidebarButton label="Dashboard" icon="house" />
            <BtsSidebarButton label="Proposals" icon="file" selected />
            <BtsSidebarButton label="Clients" icon="user" />
          </template>
          <template #settings>
            <BtsSidebarButton label="Settings" icon="gear" expandable />
          </template>
          <template #footer>
            <BtsSidebarButton label="Help" icon="circle-question" />
            <BtsSidebarButton label="Logout" icon="right-from-bracket" />
          </template>
        </BtsSidebar>
        <BtsSidebar :toggleable="false" :showAvatar="false" :isOpen="false" companyName="C" style="min-height: 400px; height: auto;">
          <template #navigation>
            <BtsSidebarButton icon="house" collapsed />
            <BtsSidebarButton icon="file" selected collapsed />
            <BtsSidebarButton icon="user" collapsed />
          </template>
          <template #settings>
            <BtsSidebarButton icon="gear" collapsed />
          </template>
          <template #footer>
            <BtsSidebarButton icon="circle-question" collapsed />
            <BtsSidebarButton icon="right-from-bracket" collapsed />
          </template>
        </BtsSidebar>
      </div>
    `,
  }),
};

