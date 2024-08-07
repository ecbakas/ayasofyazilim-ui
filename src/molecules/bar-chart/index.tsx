// Tremor Raw BarChart [v0.1.1]

'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  Label,
  BarChart as RechartsBarChart,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';

import { useOnWindowResize } from '../../lib/hooks/useOnWindowResize';
import {
  AvailableChartColors,
  AvailableChartColorsKeys,
  constructCategoryColors,
  getColorClassName,
} from '../../lib/utils/chartColors';
import { cn } from '@/lib/utils';
import { getYAxisDomain } from '../../lib/utils/getYAxisDomain';

// #region Shape
export function deepEqual(obj1: any, obj2: any) {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  )
    return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

const renderShape = (
  props: any,
  activeBar: any | undefined,
  activeLegend: string | undefined,
  layout: string
) => {
  const { fillOpacity, name, payload, value } = props;
  let { x, width, y, height } = props;

  if (layout === 'horizontal' && height < 0) {
    y += height;
    height = Math.abs(height); // height must be a positive number
  } else if (layout === 'vertical' && width < 0) {
    x += width;
    width = Math.abs(width); // width must be a positive number
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={
        activeBar || (activeLegend && activeLegend !== name)
          ? deepEqual(activeBar, { ...payload, value })
            ? fillOpacity
            : 0.3
          : fillOpacity
      }
    />
  );
};

// #region Legend

interface LegendItemProps {
  activeLegend?: string;
  color: AvailableChartColorsKeys;
  name: string;
  onClick?: (name: string, color: AvailableChartColorsKeys) => void;
}

const LegendItem = ({
  name,
  color,
  onClick,
  activeLegend,
}: LegendItemProps) => {
  const hasOnValueChange = !!onClick;
  return (
    <li
      className={cn(
        // base
        'group inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 transition',
        hasOnValueChange ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(name, color);
      }}
    >
      <span
        className={cn(
          'size-2 shrink-0 rounded-sm',
          getColorClassName(color, 'bg'),
          activeLegend && activeLegend !== name ? 'opacity-40' : 'opacity-100'
        )}
        aria-hidden
      />
      <p
        className={cn(
          // base
          'truncate whitespace-nowrap text-xs',
          // text color
          'text-gray-700',
          hasOnValueChange && 'group-hover:text-gray-900',
          activeLegend && activeLegend !== name ? 'opacity-40' : 'opacity-100'
        )}
      >
        {name}
      </p>
    </li>
  );
};

interface ScrollButtonProps {
  disabled?: boolean;
  icon: React.ElementType;
  onClick?: () => void;
}

const ScrollButton = ({ icon, onClick, disabled }: ScrollButtonProps) => {
  const Icon = icon;
  const [isPressed, setIsPressed] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isPressed) {
      intervalRef.current = setInterval(() => {
        onClick?.();
      }, 300);
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isPressed, onClick]);

  React.useEffect(() => {
    if (disabled) {
      clearInterval(intervalRef.current as NodeJS.Timeout);
      setIsPressed(false);
    }
  }, [disabled]);

  return (
    <button
      type="button"
      className={cn(
        // base
        'group inline-flex size-5 items-center truncate rounded transition',
        disabled
          ? 'cursor-not-allowed text-gray-400'
          : 'cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      )}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        setIsPressed(true);
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        setIsPressed(false);
      }}
    >
      <Icon className="size-full" aria-hidden="true" />
    </button>
  );
};

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  activeLegend?: string;
  categories: string[];
  colors?: AvailableChartColorsKeys[];
  enableLegendSlider?: boolean;
  onClickLegendItem?: (category: string, color: string) => void;
}

type HasScrollProps = {
  left: boolean;
  right: boolean;
};

const Legend = React.forwardRef<HTMLOListElement, LegendProps>((props, ref) => {
  const {
    categories,
    colors = AvailableChartColors,
    className,
    onClickLegendItem,
    activeLegend,
    enableLegendSlider = false,
    ...other
  } = props;
  const scrollableRef = React.useRef<HTMLInputElement>(null);
  const scrollButtonsRef = React.useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = React.useState<HasScrollProps | null>(null);
  const [isKeyDowned, setIsKeyDowned] = React.useState<string | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const checkScroll = React.useCallback(() => {
    const scrollable = scrollableRef?.current;
    if (!scrollable) return;

    const hasLeftScroll = scrollable.scrollLeft > 0;
    const hasRightScroll =
      scrollable.scrollWidth - scrollable.clientWidth > scrollable.scrollLeft;

    setHasScroll({ left: hasLeftScroll, right: hasRightScroll });
  }, [setHasScroll]);

  const scrollToTest = React.useCallback(
    (direction: 'left' | 'right') => {
      const element = scrollableRef?.current;
      const scrollButtons = scrollButtonsRef?.current;
      const scrollButtonsWith = scrollButtons?.clientWidth ?? 0;
      const width = element?.clientWidth ?? 0;

      if (element && enableLegendSlider) {
        element.scrollTo({
          left:
            direction === 'left'
              ? element.scrollLeft - width + scrollButtonsWith
              : element.scrollLeft + width - scrollButtonsWith,
          behavior: 'smooth',
        });
        setTimeout(() => {
          checkScroll();
        }, 400);
      }
    },
    [enableLegendSlider, checkScroll]
  );

  React.useEffect(() => {
    const keyDownHandler = (key: string) => {
      if (key === 'ArrowLeft') {
        scrollToTest('left');
      } else if (key === 'ArrowRight') {
        scrollToTest('right');
      }
    };
    if (isKeyDowned) {
      keyDownHandler(isKeyDowned);
      intervalRef.current = setInterval(() => {
        keyDownHandler(isKeyDowned);
      }, 300);
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout);
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout);
  }, [isKeyDowned, scrollToTest]);

  const keyDown = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setIsKeyDowned(e.key);
    }
  };
  const keyUp = (e: KeyboardEvent) => {
    e.stopPropagation();
    setIsKeyDowned(null);
  };

  React.useEffect(() => {
    const scrollable = scrollableRef?.current;
    if (enableLegendSlider) {
      checkScroll();
      scrollable?.addEventListener('keydown', keyDown);
      scrollable?.addEventListener('keyup', keyUp);
    }

    return () => {
      scrollable?.removeEventListener('keydown', keyDown);
      scrollable?.removeEventListener('keyup', keyUp);
    };
  }, [checkScroll, enableLegendSlider]);

  return (
    <ol
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      {...other}
    >
      <div
        ref={scrollableRef}
        tabIndex={0}
        className={cn(
          'flex h-full',
          enableLegendSlider
            ? hasScroll?.right || hasScroll?.left
              ? 'snap-mandatory items-center overflow-auto pl-4 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
              : ''
            : 'flex-wrap'
        )}
      >
        {categories.map((category, index) => (
          <LegendItem
            key={`item-${index}`}
            name={category}
            color={colors[index] as AvailableChartColorsKeys}
            onClick={onClickLegendItem}
            activeLegend={activeLegend}
          />
        ))}
      </div>
      {enableLegendSlider && (hasScroll?.right || hasScroll?.left) ? (
        <div
          className={cn(
            // base
            'absolute bottom-0 right-0 top-0 flex h-full items-center justify-center pr-1',
            // background color
            'bg-white'
          )}
        >
          <ScrollButton
            icon={ArrowLeft}
            onClick={() => {
              setIsKeyDowned(null);
              scrollToTest('left');
            }}
            disabled={!hasScroll?.left}
          />
          <ScrollButton
            icon={ArrowRight}
            onClick={() => {
              setIsKeyDowned(null);
              scrollToTest('right');
            }}
            disabled={!hasScroll?.right}
          />
        </div>
      ) : null}
    </ol>
  );
});

Legend.displayName = 'Legend';

const ChartLegend = (
  { payload }: any,
  categoryColors: Map<string, AvailableChartColorsKeys>,
  setLegendHeight: React.Dispatch<React.SetStateAction<number>>,
  activeLegend: string | undefined,
  onClick?: (category: string, color: string) => void,
  enableLegendSlider?: boolean,
  legendPosition?: 'left' | 'center' | 'right',
  yAxisWidth?: number
) => {
  const legendRef = React.useRef<HTMLDivElement>(null);

  useOnWindowResize(() => {
    const calculateHeight = (height: number | undefined) =>
      height ? Number(height) + 15 : 60;
    setLegendHeight(calculateHeight(legendRef.current?.clientHeight));
  });

  const filteredPayload = payload.filter((item: any) => item.type !== 'none');

  const paddingLeft =
    legendPosition === 'left' && yAxisWidth ? yAxisWidth - 8 : 0;

  return (
    <div
      style={{ paddingLeft }}
      ref={legendRef}
      className={cn(
        'flex items-center',
        { 'justify-center': legendPosition === 'center' },
        {
          'justify-start': legendPosition === 'left',
        },
        { 'justify-end': legendPosition === 'right' }
      )}
    >
      <Legend
        categories={filteredPayload.map((entry: any) => entry.value)}
        colors={filteredPayload.map((entry: any) =>
          categoryColors.get(entry.value)
        )}
        onClickLegendItem={onClick}
        activeLegend={activeLegend}
        enableLegendSlider={enableLegendSlider}
      />
    </div>
  );
};

// #region Tooltip

interface ChartTooltipRowProps {
  color: string;
  name: string;
  value: string;
}

const ChartTooltipRow = ({ value, name, color }: ChartTooltipRowProps) => (
  <div className="flex items-center justify-between space-x-8">
    <div className="flex items-center space-x-2">
      <span
        aria-hidden="true"
        className={cn('size-2 shrink-0 rounded-sm', color)}
      />
      <p
        className={cn(
          // commmon
          'whitespace-nowrap text-right',
          // text color
          'text-gray-700'
        )}
      >
        {name}
      </p>
    </div>
    <p
      className={cn(
        // base
        'whitespace-nowrap text-right font-medium tabular-nums',
        // text color
        'text-gray-900'
      )}
    >
      {value}
    </p>
  </div>
);

type TooltipCallbackProps = Pick<
  ChartTooltipProps,
  'active' | 'payload' | 'label'
>;

interface ChartTooltipProps {
  active: boolean | undefined;
  categoryColors: Map<string, string>;
  label: string;
  payload: any;
  valueFormatter: (value: number) => string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
  categoryColors,
  valueFormatter,
}: ChartTooltipProps) => {
  if (active && payload) {
    const filteredPayload = payload.filter((item: any) => item.type !== 'none');

    return (
      <div
        className={cn(
          // base
          'rounded-md border text-sm shadow-md',
          // border color
          'border-gray-200',
          // background color
          'bg-white'
        )}
      >
        <div
          className={cn(
            // base
            'border-b border-inherit px-4 py-2'
          )}
        >
          <p
            className={cn(
              // base
              'font-medium',
              // text color
              'text-gray-900'
            )}
          >
            {label}
          </p>
        </div>

        <div className={cn('space-y-1 px-4 py-2')}>
          {filteredPayload.map(
            (
              { value, name }: { name: string; value: number },
              index: number
            ) => (
              <ChartTooltipRow
                key={`id-${index}`}
                value={valueFormatter(value)}
                name={name}
                color={getColorClassName(
                  categoryColors.get(name) as AvailableChartColorsKeys,
                  'bg'
                )}
              />
            )
          )}
        </div>
      </div>
    );
  }
  return null;
};

// #region BarChart

type BaseEventProps = {
  [key: string]: number | string;
  categoryClicked: string;
  eventType: 'category' | 'bar';
};

type BarChartEventProps = BaseEventProps | null | undefined;

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  allowDecimals?: boolean;
  autoMinValue?: boolean;
  barCategoryGap?: string | number;
  categories: string[];
  colors?: AvailableChartColorsKeys[];
  data: Record<string, any>[];
  enableLegendSlider?: boolean;
  index: string;
  intervalType?: 'preserveStartEnd' | 'equidistantPreserveStart';
  layout?: 'vertical' | 'horizontal';
  legendPosition?: 'left' | 'center' | 'right';
  maxValue?: number;
  minValue?: number;
  onValueChange?: (value: BarChartEventProps) => void;
  showGridLines?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  startEndOnly?: boolean;
  tickGap?: number;
  tooltipCallback?: (tooltipCallbackContent: TooltipCallbackProps) => void;
  type?: 'default' | 'stacked' | 'percent';
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (props, forwardedRef) => {
    const {
      data = [],
      categories = [],
      index,
      colors = AvailableChartColors,
      valueFormatter = (value: number) => value.toString(),
      startEndOnly = false,
      showXAxis = true,
      showYAxis = true,
      showGridLines = true,
      yAxisWidth = 56,
      intervalType = 'equidistantPreserveStart',
      showTooltip = true,
      showLegend = true,
      autoMinValue = false,
      minValue,
      maxValue,
      allowDecimals = true,
      className,
      onValueChange,
      enableLegendSlider = false,
      barCategoryGap,
      tickGap = 5,
      xAxisLabel,
      yAxisLabel,
      layout = 'horizontal',
      type = 'default',
      legendPosition = 'right',
      tooltipCallback,
      ...other
    } = props;
    const paddingValue = !showXAxis && !showYAxis ? 0 : 20;
    const [legendHeight, setLegendHeight] = React.useState(60);
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(
      undefined
    );
    const categoryColors = constructCategoryColors(categories, colors);
    const [activeBar, setActiveBar] = React.useState<any | undefined>(
      undefined
    );
    const yAxisDomain = getYAxisDomain(autoMinValue, minValue, maxValue);
    const hasOnValueChange = !!onValueChange;
    const stacked = type === 'stacked' || type === 'percent';
    const valueToPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

    function onBarClick(data: any, _: any, event: React.MouseEvent) {
      event.stopPropagation();
      if (!onValueChange) return;
      if (deepEqual(activeBar, { ...data.payload, value: data.value })) {
        setActiveLegend(undefined);
        setActiveBar(undefined);
        onValueChange?.(null);
      } else {
        setActiveLegend(data.tooltipPayload?.[0]?.dataKey);
        setActiveBar({
          ...data.payload,
          value: data.value,
        });
        onValueChange?.({
          eventType: 'bar',
          categoryClicked: data.tooltipPayload?.[0]?.dataKey,
          ...data.payload,
        });
      }
    }

    function onCategoryClick(dataKey: string) {
      if (!hasOnValueChange) return;
      if (dataKey === activeLegend && !activeBar) {
        setActiveLegend(undefined);
        onValueChange?.(null);
      } else {
        setActiveLegend(dataKey);
        onValueChange?.({
          eventType: 'category',
          categoryClicked: dataKey,
        });
      }
      setActiveBar(undefined);
    }

    return (
      <div
        ref={forwardedRef}
        className={cn('h-80 w-full', className)}
        {...other}
      >
        <ResponsiveContainer>
          <RechartsBarChart
            data={data}
            onClick={
              hasOnValueChange && (activeLegend || activeBar)
                ? () => {
                    setActiveBar(undefined);
                    setActiveLegend(undefined);
                    onValueChange?.(null);
                  }
                : undefined
            }
            margin={{
              bottom: xAxisLabel ? 30 : undefined,
              left: yAxisLabel ? 20 : undefined,
              right: yAxisLabel ? 5 : undefined,
              top: 5,
            }}
            stackOffset={type === 'percent' ? 'expand' : undefined}
            layout={layout}
            barCategoryGap={barCategoryGap}
          >
            {showGridLines ? (
              <CartesianGrid
                className={cn('stroke-gray-200 stroke-1 ')}
                horizontal={layout !== 'vertical'}
                vertical={layout === 'vertical'}
              />
            ) : null}
            <XAxis
              hide={!showXAxis}
              tick={{
                transform:
                  layout !== 'vertical' ? 'translate(0, 6)' : undefined,
              }}
              fill=""
              stroke=""
              className={cn(
                // base
                'text-xs',
                // text fill
                'fill-gray-500 ',
                { 'mt-4': layout !== 'vertical' }
              )}
              tickLine={false}
              axisLine={false}
              minTickGap={tickGap}
              {...(layout !== 'vertical'
                ? {
                    padding: {
                      left: paddingValue,
                      right: paddingValue,
                    },
                    dataKey: index,
                    interval: startEndOnly ? 'preserveStartEnd' : intervalType,
                    ticks: startEndOnly
                      ? [data[0][index], data[data.length - 1][index]]
                      : undefined,
                  }
                : {
                    type: 'number',
                    domain: yAxisDomain as AxisDomain,
                    tickFormatter:
                      type === 'percent' ? valueToPercent : valueFormatter,
                    allowDecimals,
                  })}
            >
              {xAxisLabel && (
                <Label
                  position="insideBottom"
                  offset={-20}
                  className="fill-gray-800 text-sm font-medium "
                >
                  {xAxisLabel}
                </Label>
              )}
            </XAxis>
            <YAxis
              width={yAxisWidth}
              hide={!showYAxis}
              axisLine={false}
              tickLine={false}
              fill=""
              stroke=""
              className={cn(
                // base
                'text-xs',
                // text fill
                'fill-gray-500 '
              )}
              tick={{
                transform:
                  layout !== 'vertical'
                    ? 'translate(-3, 0)'
                    : 'translate(0, 0)',
              }}
              {...(layout !== 'vertical'
                ? {
                    type: 'number',
                    domain: yAxisDomain as AxisDomain,
                    tickFormatter:
                      type === 'percent' ? valueToPercent : valueFormatter,
                    allowDecimals,
                  }
                : {
                    dataKey: index,
                    ticks: startEndOnly
                      ? [data[0][index], data[data.length - 1][index]]
                      : undefined,
                    type: 'category',
                    interval: 'equidistantPreserveStart',
                  })}
            >
              {yAxisLabel && (
                <Label
                  position="insideLeft"
                  style={{ textAnchor: 'middle' }}
                  angle={-90}
                  offset={-15}
                  className="fill-gray-800 text-sm font-medium "
                >
                  {yAxisLabel}
                </Label>
              )}
            </YAxis>
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              isAnimationActive
              animationDuration={100}
              cursor={{ fill: '#d1d5db', opacity: '0.15' }}
              offset={20}
              position={{
                y: layout === 'horizontal' ? 0 : undefined,
                x: layout === 'horizontal' ? undefined : yAxisWidth + 20,
              }}
              content={({ active, payload, label }: any) => {
                React.useEffect(() => {
                  if (tooltipCallback && payload) {
                    const filteredPayload = payload.map((item: any) => ({
                      category: item.dataKey,
                      value: item.value,
                      index: item.payload.date,
                      color: categoryColors.get(
                        item.dataKey
                      ) as AvailableChartColorsKeys,
                      payload: item.payload,
                    }));
                    tooltipCallback({
                      active,
                      payload: filteredPayload,
                      label,
                    });
                  }
                }, [label, active]);

                return showTooltip && active ? (
                  <ChartTooltip
                    active={active}
                    payload={payload}
                    label={label}
                    valueFormatter={valueFormatter}
                    categoryColors={categoryColors}
                  />
                ) : null;
              }}
            />
            {showLegend ? (
              <RechartsLegend
                verticalAlign="top"
                height={legendHeight}
                content={({ payload }: any) =>
                  ChartLegend(
                    { payload },
                    categoryColors,
                    setLegendHeight,
                    activeLegend,
                    hasOnValueChange
                      ? (clickedLegendItem: string) =>
                          onCategoryClick(clickedLegendItem)
                      : undefined,
                    enableLegendSlider,
                    legendPosition,
                    yAxisWidth
                  )
                }
              />
            ) : null}
            {categories.map((category) => (
              <Bar
                className={cn(
                  getColorClassName(
                    categoryColors.get(category) as AvailableChartColorsKeys,
                    'fill'
                  ),
                  onValueChange ? 'cursor-pointer' : ''
                )}
                key={category}
                name={category}
                type="linear"
                dataKey={category}
                stackId={stacked ? 'stack' : undefined}
                isAnimationActive={false}
                fill=""
                shape={(props: any) =>
                  renderShape(props, activeBar, activeLegend, layout)
                }
                onClick={onBarClick}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

BarChart.displayName = 'BarChart';

export { BarChart, type BarChartEventProps, type TooltipCallbackProps };
