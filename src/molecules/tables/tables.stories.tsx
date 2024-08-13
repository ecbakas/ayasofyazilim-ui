/* eslint-disable no-alert */
import { Meta, StoryObj } from '@storybook/react';

import jsonToCsv from 'src/lib/json-to-csv';
import { z } from 'zod';
import { useState } from 'react';
import { AutoFormProps } from 'src/organisms/auto-form';
import Table, { AutoColumnGenerator, TableAction } from '.';
import { createZodObject } from '../../lib/create-zod-object';
import {
  columns,
  columnsEditable,
  columnsSubContent,
  renderSubComponent,
} from './columns';
import { data } from './data';

const formSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required.',
    })
    .min(2, {
      message: 'Username must be at least 2 characters.',
    }),

  password: z
    .string({
      required_error: 'Password is required.',
    })
    .describe('Your secure password')
    .min(8, {
      message: 'Password must be at least 8 characters.',
    }),
});

const autoFormArgs: AutoFormProps = {
  formSchema,
  fieldConfig: {
    password: {
      inputProps: {
        type: 'password',
        placeholder: '••••••••',
      },
    },
  },
  children: <div>Extra data</div>,
};

const action: TableAction = {
  cta: 'New Record',
  type: 'Dialog',
  description: 'Add New Record',
  callback: () => alert('Added'),
  autoFormArgs,
};

/**
 * # Table stories
 * Awesome datatable that provides a lot of features.
 *
 * like: custom data tables, custom columsn, auto generated columns, etc
 */
export default { component: Table } as Meta<typeof Table>;

export const Default: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Custom',
      data: columns,
    },
    action,
  },
  parameters: {
    layout: 'centered',
  },
};

// Status	Email	Amount
const jsonSchema: any = {
  type: 'object',
  required: ['status', 'email', 'amount'],
  properties: {
    status: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    amount: {
      type: 'number',
    },
    date: {
      type: 'string',
    },
  },
};

export const AutoColumns: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Auto',
      data: {
        callback: () => alert('Added Callback'),
        autoFormArgs: {
          formSchema: createZodObject(jsonSchema, [
            'status',
            'email',
            'amount',
          ]),
        },
        tableType: jsonSchema,
        excludeList: ['id'],
        onEdit: (values, row) => {
          alert(
            `OnEdit \ndata:\n${JSON.stringify(values)} \nRow:\n${JSON.stringify(row)}`
          );
        },
        onDelete: (e, row) => {
          alert(
            `OnDelete \ndata:\n${JSON.stringify(e)} \nRow:\n${JSON.stringify(row)}`
          );
        },
        actionList: [
          {
            cta: 'Test',
            callback: (e, row) => alert(`Test ${JSON.stringify(row)}`),
          },
          {
            cta: 'Hello world',
            callback: (e, row) => alert(`hello world ${JSON.stringify(row)}`),
          },
        ],
      },
    },
    action,
  },
  parameters: {
    layout: 'centered',
  },
};
const autoColumnData: AutoColumnGenerator = {
  callback: () => alert('Added Callback'),
  autoFormArgs: {
    formSchema: createZodObject(jsonSchema, [
      'status',
      'email',
      'amount',
      'date',
    ]),
  },
  tableType: jsonSchema,
  excludeList: ['id'],
  onEdit: (values, row) => {
    alert(
      `OnEdit \ndata:\n${JSON.stringify(values)} \nRow:\n${JSON.stringify(row)}`
    );
  },
  onDelete: (e, row) => {
    alert(
      `OnDelete \ndata:\n${JSON.stringify(e)} \nRow:\n${JSON.stringify(row)}`
    );
  },
};

export const NewPage: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Auto',
      data: autoColumnData,
    },
    action: {
      cta: 'New Record',
      type: 'NewPage',
      href: '/new-page',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export const Sheet: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Auto',
      data: {
        callback: () => alert('Added Callback'),
        autoFormArgs: {
          formSchema: createZodObject(jsonSchema, [
            'status',
            'email',
            'amount',
          ]),
        },
        tableType: jsonSchema,
        excludeList: ['id'],
        onEdit: (values, row) => {
          alert(
            `OnEdit \ndata:\n${JSON.stringify(values)} \nRow:\n${JSON.stringify(row)}`
          );
        },
        onDelete: (e, row) => {
          alert(
            `OnDelete \ndata:\n${JSON.stringify(e)} \nRow:\n${JSON.stringify(row)}`
          );
        },
      },
    },
    action: {
      cta: 'New Record',
      description: 'Add New Record',
      callback: () => alert('Added'),
      autoFormArgs,
      type: 'Sheet',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export const MultipleActions: StoryObj<typeof Table> = {
  args: {
    data,
    columnsData: {
      type: 'Auto',
      data: {
        callback: () => alert('Added Callback'),
        autoFormArgs: {
          formSchema: createZodObject(jsonSchema, [
            'status',
            'email',
            'amount',
          ]),
        },
        tableType: jsonSchema,
        excludeList: ['id'],
        onEdit: (values, row) => {
          alert(
            `OnEdit \ndata:\n${JSON.stringify(values)} \nRow:\n${JSON.stringify(row)}`
          );
        },
        onDelete: (e, row) => {
          alert(
            `OnDelete \ndata:\n${JSON.stringify(e)} \nRow:\n${JSON.stringify(row)}`
          );
        },
      },
    },
    action: [
      {
        cta: 'New Record sheet',
        description: 'Add New Record',
        callback: () => alert('Added'),
        autoFormArgs,
        type: 'Sheet',
      },
      {
        cta: 'New Dialog',
        description: 'Add New Record',
        callback: () => alert('Added'),
        autoFormArgs,
        type: 'Dialog',
      },
      {
        cta: 'New New Page',
        type: 'NewPage',
        href: '/new-page',
      },
      {
        type: 'Action',
        cta: `Export CSV`,
        callback: () => {
          jsonToCsv(data, 'export_data');
        },
      },
    ],
  },
  parameters: {
    layout: 'centered',
  },
};
const filedstable = { name: '', price: '' };
export const Editable: StoryObj<typeof Table> = {
  args: {
    editable: true,
    data,
    columnsData: {
      type: 'Custom',
      data: columnsEditable,
    },
    showView: false,
    Headertable: filedstable,
  },
  parameters: {
    layout: 'centered',
  },
};

export const SubContent: StoryObj<typeof Table> = {
  args: {
    editable: false,
    data,
    columnsData: {
      type: 'Custom',
      data: columnsSubContent,
    },
    showView: false,
    renderSubComponent,
  },
  parameters: {
    layout: 'centered',
  },
};
export const DetailedFilter: StoryObj<typeof Table> = {
  render: (args) => {
    const [tableData, setTableData] = useState(data);
    return (
      <Table
        {...args}
        data={tableData}
        fetchRequest={(page: any, filter: any) =>
          args.fetchRequest(filter, setTableData)
        }
      />
    );
  },
  args: {
    fetchRequest: (filter: string, setTableData: (data: unknown[]) => any) => {
      const parsedFilter = JSON.parse(filter);
      const email = parsedFilter.email || '';
      const date = new Date(parsedFilter.date || '').getTime();
      const filteredData = data.filter((i) => {
        const itemDate = new Date(i.date || '').getTime();
        return i.email.includes(email) && itemDate < date;
      });
      if (!email && !date) {
        setTableData(data);
        return;
      }
      setTableData(filteredData);
    },
    editable: false,
    data,
    columnsData: {
      type: 'Auto',
      data: autoColumnData,
    },
    showView: false,
    detailedFilter: [
      {
        name: 'email',
        displayName: 'Email',
        type: 'string',
        value: '',
      },
      {
        name: 'date',
        displayName: 'Date Less than',
        type: 'date',
        value: new Date().toISOString(),
      },
    ],
  },
  parameters: {
    layout: 'centered',
  },
};
