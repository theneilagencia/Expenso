import BtsStatCard from './BtsStatCard.vue';

/**
 * StatCard component for displaying metrics and KPIs.
 *
 * **Features:**
 * - Icon with color variants (same as BtsBadge)
 * - Title, value, and optional subtitle
 * - Optional trend indicator (up/down/neutral)
 */
export default {
  title: 'Components/StatCard',
  component: BtsStatCard,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'text',
      description: 'Font Awesome icon name',
    },
    iconPrefix: {
      control: 'select',
      options: ['far', 'fas'],
      description: 'Font Awesome prefix',
    },
    variant: {
      control: 'select',
      options: ['success', 'warning', 'danger', 'info', 'default', 'primary'],
      description: 'Icon color variant (same as BtsBadge)',
    },
    title: {
      control: 'text',
      description: 'Card title',
    },
    value: {
      control: 'text',
      description: 'Main value to display',
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle text (optional)',
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
      description: 'Trend direction',
    },
    trendValue: {
      control: 'text',
      description: 'Trend text (e.g., "+10 last 30 days")',
    },
  },
};

const Template = (args) => ({
  components: { BtsStatCard },
  setup() { return { args }; },
  template: '<BtsStatCard v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
  icon: 'users',
  variant: 'primary',
  title: 'Total Users',
  value: '5',
  trendValue: '+0 last 30 days',
  trend: 'neutral',
};

export const WithSubtitle = Template.bind({});
WithSubtitle.args = {
  icon: 'user',
  variant: 'info',
  title: 'Structures per User',
  value: '0.6',
  subtitle: 'Average',
};

export const Success = Template.bind({});
Success.args = {
  icon: 'circle-check',
  variant: 'success',
  title: 'Delivered Structures',
  value: '0',
  subtitle: 'Timeline 100% complete',
};

export const Warning = Template.bind({});
Warning.args = {
  icon: 'triangle-exclamation',
  variant: 'warning',
  title: 'Pending documents > 48h',
  value: '0',
  subtitle: 'Require attention',
};

export const TrendUp = Template.bind({});
TrendUp.args = {
  icon: 'chart-line',
  variant: 'success',
  title: 'Monthly Revenue',
  value: 'R$ 45,678',
  trendValue: '+12% vs previous month',
  trend: 'up',
};

export const TrendDown = Template.bind({});
TrendDown.args = {
  icon: 'chart-line',
  variant: 'danger',
  title: 'Cancellation Rate',
  value: '3.2%',
  trendValue: '-0.5% vs previous month',
  trend: 'down',
};

export const AllVariants = () => ({
  components: { BtsStatCard },
  template: `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
      <BtsStatCard
        icon="users"
        variant="primary"
        title="Total Users"
        value="5"
        trend-value="+0 last 30 days"
        trend="neutral"
      />
      <BtsStatCard
        icon="building"
        variant="info"
        title="Total Structures"
        value="3"
        trend-value="+0 last 30 days"
        trend="neutral"
      />
      <BtsStatCard
        icon="user"
        variant="default"
        title="Structures per User"
        value="0.6"
        subtitle="Average"
      />
      <BtsStatCard
        icon="circle-check"
        variant="success"
        title="Delivered Structures"
        value="0"
        subtitle="Timeline 100% complete"
      />
      <BtsStatCard
        icon="triangle-exclamation"
        variant="warning"
        title="Pending documents > 48h"
        value="0"
        subtitle="Require attention"
      />
    </div>
  `,
});
AllVariants.storyName = 'Dashboard Example';

