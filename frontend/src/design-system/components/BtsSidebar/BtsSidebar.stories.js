import BtsSidebar from './BtsSidebar.vue';
import BtsSidebarButton from '../BtsSidebarButton/BtsSidebarButton.vue';

/**
 * Sidebar component based on Figma design.
 *
 * **Figma specs:**
 * - Width Open: 256px
 * - Width Collapsed: 92px
 * - Height: 960px (full height)
 * - Background: #18365b
 * - Padding: 24px
 * - Item spacing: 24px
 *
 * **Profile section:**
 * - Avatar: 44x44px circle (white bg)
 * - Title: Inter Medium 16px, color #ffffff
 * - Overline: Inter Medium 10px, uppercase, color #c6c6c6
 *
 * **Toggle button:**
 * - Size: 28x28px
 * - Border: 1px solid #ffffff
 * - Border-radius: 8px
 * - Position: absolute top-right
 *
 * **Divider:**
 * - Height: 2px, background #ffffff, border-radius 2px
 *
 * **Slots:**
 * - `navigation`: Main navigation items
 * - `section-title`: Settings section title (default: "SETTINGS")
 * - `settings`: Settings navigation items
 * - `footer`: Footer navigation items (Help, Logout)
 */
export default {
  title: 'Components/Sidebar',
  component: BtsSidebar,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean', description: 'Sidebar open/collapsed state' },
    userName: { control: 'text', description: 'User name (shown as overline)' },
    companyName: { control: 'text', description: 'Company name (shown as title)' },
    avatarUrl: { control: 'text', description: 'Avatar image URL' },
    toggleable: { control: 'boolean', description: 'Show/hide the collapse/expand toggle button' },
    showAvatar: { control: 'boolean', description: 'Show/hide the avatar (keeps name and overline visible)' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Sidebar color variant (primary: #18365b, secondary: #f4f4f4)',
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const Open = () => ({
  components: { BtsSidebar, BtsSidebarButton },
  template: `
    <div style="height: 100vh; padding-left: 20px;">
      <BtsSidebar
        :is-open="isOpen"
        user-name="PARTNER PORTAL - DIGITAL OFFSHORE"
        company-name="Safe Tecnologia"
        @toggle="isOpen = !isOpen"
      >
        <template #navigation>
          <BtsSidebarButton label="Dashboard" icon="house" :collapsed="!isOpen" />
          <BtsSidebarButton label="Proposals" icon="file" selected :collapsed="!isOpen" />
          <BtsSidebarButton label="Clients" icon="user" :collapsed="!isOpen" />
        </template>

        <template #settings>
          <BtsSidebarButton
            label="Settings"
            icon="gear"
            expandable
            :expanded="expandedSettings"
            :collapsed="!isOpen"
            @toggle="expandedSettings = $event"
          >
            <template #submenu>
              <BtsSidebarButton label="Profile" icon="user" />
              <BtsSidebarButton label="Security" icon="lock" />
              <BtsSidebarButton label="Notifications" icon="bell" />
            </template>
          </BtsSidebarButton>
        </template>

        <template #footer>
          <BtsSidebarButton label="Help" icon="circle-question" :collapsed="!isOpen" />
          <BtsSidebarButton label="Logout Account" icon="right-from-bracket" :collapsed="!isOpen" />
        </template>
      </BtsSidebar>
    </div>
  `,
  data() {
    return {
      isOpen: true,
      expandedSettings: false,
    };
  },
});

export const Collapsed = () => ({
  components: { BtsSidebar, BtsSidebarButton },
  template: `
    <div style="height: 100vh; padding-left: 20px;">
      <BtsSidebar
        :is-open="isOpen"
        user-name="PARTNER PORTAL"
        company-name="Safe Tecnologia"
        @toggle="isOpen = !isOpen"
      >
        <template #navigation>
          <BtsSidebarButton label="Dashboard" icon="house" :collapsed="!isOpen" />
          <BtsSidebarButton label="Proposals" icon="file" selected :collapsed="!isOpen" />
          <BtsSidebarButton label="Clients" icon="user" :collapsed="!isOpen" />
        </template>

        <template #settings>
          <BtsSidebarButton label="Settings" icon="gear" expandable :collapsed="!isOpen" />
        </template>

        <template #footer>
          <BtsSidebarButton label="Help" icon="circle-question" :collapsed="!isOpen" />
          <BtsSidebarButton label="Logout Account" icon="right-from-bracket" :collapsed="!isOpen" />
        </template>
      </BtsSidebar>
    </div>
  `,
  data() {
    return { isOpen: false };
  },
});

export const WithoutToggle = () => ({
  components: { BtsSidebar, BtsSidebarButton },
  template: `
    <div style="height: 100vh; padding-left: 20px;">
      <BtsSidebar
        :is-open="true"
        user-name="PARTNER PORTAL"
        company-name="Safe Tecnologia"
        :toggleable="false"
      >
        <template #navigation>
          <BtsSidebarButton label="Dashboard" icon="house" selected />
          <BtsSidebarButton label="Proposals" icon="file" />
          <BtsSidebarButton label="Clients" icon="user" />
          <BtsSidebarButton label="Reports" icon="chart-bar" />
        </template>

        <template #settings>
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
            </template>
          </BtsSidebarButton>
        </template>

        <template #footer>
          <BtsSidebarButton label="Help" icon="circle-question" />
          <BtsSidebarButton label="Logout" icon="right-from-bracket" />
        </template>
      </BtsSidebar>

      <div style="position: fixed; top: 20px; right: 20px; background: white; padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <strong>Note:</strong> Toggle button is hidden (toggleable=false)
      </div>
    </div>
  `,
  data() {
    return {
      expandedSettings: false,
    };
  },
});

export const WithAvatar = () => ({
  components: { BtsSidebar, BtsSidebarButton },
  template: `
    <div style="height: 100vh; padding-left: 20px;">
      <BtsSidebar
        :is-open="isOpen"
        user-name="BYEBNK TECNOLOGIA"
        company-name="John Smith"
        avatar-url="https://i.pravatar.cc/88"
        @toggle="isOpen = !isOpen"
      >
        <template #navigation>
          <BtsSidebarButton label="Dashboard" icon="house" selected :collapsed="!isOpen" />
          <BtsSidebarButton
            label="Clients"
            icon="user"
            expandable
            :expanded="expandedClients"
            :collapsed="!isOpen"
            @toggle="expandedClients = $event"
          >
            <template #submenu>
              <BtsSidebarButton label="All" icon="users" />
              <BtsSidebarButton label="Active" icon="circle-check" />
              <BtsSidebarButton label="Inactive" icon="circle-xmark" />
            </template>
          </BtsSidebarButton>
          <BtsSidebarButton label="Proposals" icon="file" :collapsed="!isOpen" />
          <BtsSidebarButton label="Reports" icon="chart-bar" :collapsed="!isOpen" />
        </template>

        <template #section-title>ADMINISTRATION</template>

        <template #settings>
          <BtsSidebarButton
            label="Settings"
            icon="gear"
            expandable
            :expanded="expandedSettings"
            :collapsed="!isOpen"
            @toggle="expandedSettings = $event"
          >
            <template #submenu>
              <BtsSidebarButton label="Profile" icon="user" />
              <BtsSidebarButton label="Security" icon="lock" />
              <BtsSidebarButton label="Notifications" icon="bell" />
              <BtsSidebarButton label="Privacy" icon="shield" />
            </template>
          </BtsSidebarButton>
          <BtsSidebarButton label="Users" icon="users" :collapsed="!isOpen" />
        </template>

        <template #footer>
          <BtsSidebarButton label="Help" icon="circle-question" :collapsed="!isOpen" />
          <BtsSidebarButton label="Logout" icon="right-from-bracket" :collapsed="!isOpen" />
        </template>
      </BtsSidebar>
    </div>
  `,
  data() {
    return {
      isOpen: true,
      expandedClients: false,
      expandedSettings: true,
    };
  },
});

export const Secondary = () => ({
  components: { BtsSidebar, BtsSidebarButton },
  template: `
    <div style="height: 100vh; padding-left: 20px;">
      <BtsSidebar
        :is-open="isOpen"
        user-name="PARTNER PORTAL - DIGITAL OFFSHORE"
        company-name="Safe Tecnologia"
        variant="secondary"
        @toggle="isOpen = !isOpen"
      >
        <template #navigation>
          <BtsSidebarButton label="Dashboard" icon="house" variant="secondary" :collapsed="!isOpen" />
          <BtsSidebarButton label="Proposals" icon="file" variant="secondary" selected :collapsed="!isOpen" />
          <BtsSidebarButton label="Clients" icon="user" variant="secondary" :collapsed="!isOpen" />
          <BtsSidebarButton label="Reports" icon="chart-bar" variant="secondary" :collapsed="!isOpen" />
        </template>

        <template #settings>
          <BtsSidebarButton
            label="Settings"
            icon="gear"
            variant="secondary"
            expandable
            :expanded="expandedSettings"
            :collapsed="!isOpen"
            @toggle="expandedSettings = $event"
          >
            <template #submenu>
              <BtsSidebarButton label="Profile" icon="user" variant="secondary" />
              <BtsSidebarButton label="Security" icon="lock" variant="secondary" />
              <BtsSidebarButton label="Notifications" icon="bell" variant="secondary" />
            </template>
          </BtsSidebarButton>
        </template>

        <template #footer>
          <BtsSidebarButton label="Help" icon="circle-question" variant="secondary" :collapsed="!isOpen" />
          <BtsSidebarButton label="Logout Account" icon="right-from-bracket" variant="secondary" :collapsed="!isOpen" />
        </template>
      </BtsSidebar>
    </div>
  `,
  data() {
    return {
      isOpen: true,
      expandedSettings: false,
    };
  },
});
Secondary.storyName = 'Secondary Variant';

export const WithoutAvatar = () => ({
  components: { BtsSidebar, BtsSidebarButton },
  template: `
    <div style="height: 100vh; padding-left: 20px;">
      <BtsSidebar
        :is-open="isOpen"
        user-name="PARTNER PORTAL"
        company-name="Safe Tecnologia"
        :show-avatar="false"
        @toggle="isOpen = !isOpen"
      >
        <template #navigation>
          <BtsSidebarButton label="Dashboard" icon="house" :collapsed="!isOpen" />
          <BtsSidebarButton label="Proposals" icon="file" selected :collapsed="!isOpen" />
          <BtsSidebarButton label="Clients" icon="user" :collapsed="!isOpen" />
          <BtsSidebarButton label="Reports" icon="chart-bar" :collapsed="!isOpen" />
        </template>

        <template #settings>
          <BtsSidebarButton
            label="Settings"
            icon="gear"
            expandable
            :expanded="expandedSettings"
            :collapsed="!isOpen"
            @toggle="expandedSettings = $event"
          >
            <template #submenu>
              <BtsSidebarButton label="Profile" icon="user" />
              <BtsSidebarButton label="Security" icon="lock" />
            </template>
          </BtsSidebarButton>
        </template>

        <template #footer>
          <BtsSidebarButton label="Help" icon="circle-question" :collapsed="!isOpen" />
          <BtsSidebarButton label="Logout" icon="right-from-bracket" :collapsed="!isOpen" />
        </template>
      </BtsSidebar>
    </div>
  `,
  data() {
    return {
      isOpen: true,
      expandedSettings: false,
    };
  },
});
WithoutAvatar.storyName = 'Without Avatar';
