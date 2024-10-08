import { StoryFn, Meta } from '@storybook/react';
import React from 'react';

import Issueform from '.';
import { tagExample } from './data';

export default {
  component: Issueform,
  parameters: {
    layout: 'centered',
  },
  args: {
    content: '15000',
    description: 'your target',
    footer: 'You are doing well!',
    title: 'People',
  },
} as Meta<typeof Issueform>;

const Template: StoryFn<typeof Issueform> = (args: any) => (
  <Issueform {...args} />
);

export const Default = Template.bind({});
Default.args = {
  tag: tagExample,
};
export const Loading = Template.bind({});
Loading.args = {
  tag: tagExample,
};
