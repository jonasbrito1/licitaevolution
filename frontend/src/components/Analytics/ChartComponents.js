import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';

// Componente base para gráficos
export const ChartContainer = ({ title, subtitle, loading, children, actions, height = 300, info }) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {info && (
              <Tooltip title={info} arrow>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {actions && (
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {children}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

// Gráfico de linha avançado
export const AdvancedLineChart = ({
  data,
  lines,
  title,
  subtitle,
  loading,
  height = 300,
  showGrid = true,
  showLegend = true,
  curved = true
}) => {
  const theme = useTheme();

  const formatValue = (value, type = 'number') => {
    if (type === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    if (type === 'percentage') {
      return `${value}%`;
    }
    return value?.toLocaleString('pt-BR');
  };

  // Verificar se data e lines existem e são arrays válidos
  const safeData = Array.isArray(data) ? data : [];
  const safeLines = Array.isArray(lines) ? lines : [];

  if (!safeData.length || !safeLines.length) {
    return (
      <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'text.secondary'
          }}
        >
          <Typography>Nenhum dado disponível</Typography>
        </Box>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <LineChart data={safeData}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />}
        <XAxis
          dataKey="name"
          stroke={theme.palette.text.secondary}
          fontSize={12}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          fontSize={12}
          tickFormatter={(value) => formatValue(value, safeLines[0]?.type)}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
          formatter={(value, name) => [formatValue(value, safeLines.find(l => l.dataKey === name)?.type), name]}
        />
        {showLegend && <Legend />}
        {safeLines.map((line, index) => (
          <Line
            key={line.dataKey}
            type={curved ? "monotone" : "linear"}
            dataKey={line.dataKey}
            stroke={line.color || theme.palette.primary.main}
            strokeWidth={line.strokeWidth || 2}
            name={line.name}
            dot={line.showDots !== false}
            activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};

// Gráfico de área
export const AdvancedAreaChart = ({
  data,
  areas,
  title,
  subtitle,
  loading,
  height = 300,
  stacked = false
}) => {
  const theme = useTheme();

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
        <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
        <YAxis stroke={theme.palette.text.secondary} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
        />
        <Legend />
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stackId={stacked ? "1" : area.dataKey}
            stroke={area.color || theme.palette.primary.main}
            fill={area.fill || alpha(area.color || theme.palette.primary.main, 0.3)}
            name={area.name}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
};

// Gráfico de barras avançado
export const AdvancedBarChart = ({
  data,
  bars,
  title,
  subtitle,
  loading,
  height = 300,
  horizontal = false,
  grouped = false
}) => {
  const theme = useTheme();

  const BarComponent = horizontal ? BarChart : BarChart;

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <BarComponent data={data} layout={horizontal ? 'horizontal' : 'vertical'}>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
        <XAxis
          type={horizontal ? 'number' : 'category'}
          dataKey={horizontal ? undefined : 'name'}
          stroke={theme.palette.text.secondary}
        />
        <YAxis
          type={horizontal ? 'category' : 'number'}
          dataKey={horizontal ? 'name' : undefined}
          stroke={theme.palette.text.secondary}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
        />
        <Legend />
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color || theme.palette.primary.main}
            name={bar.name}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarComponent>
    </ChartContainer>
  );
};

// Gráfico de pizza avançado
export const AdvancedPieChart = ({
  data,
  title,
  subtitle,
  loading,
  height = 300,
  showLabels = true,
  showLegend = true,
  colors
}) => {
  const theme = useTheme();

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const formatPercent = (value, total) => {
    const percent = ((value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  // Verificar se data existe e é um array válido
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((sum, item) => sum + (item?.value || 0), 0);

  // Se não há dados, mostrar mensagem
  if (!safeData.length) {
    return (
      <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'text.secondary'
          }}
        >
          <Typography>Nenhum dado disponível</Typography>
        </Box>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <PieChart>
        <Pie
          data={safeData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={showLabels ? ({ name, value }) => `${name}: ${formatPercent(value, total)}` : false}
          labelLine={false}
        >
          {safeData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors?.[index] || defaultColors[index % defaultColors.length]}
            />
          ))}
        </Pie>
        <RechartsTooltip
          formatter={(value) => [
            `${value.toLocaleString('pt-BR')} (${formatPercent(value, total)})`,
            'Valor'
          ]}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
        />
        {showLegend && <Legend />}
      </PieChart>
    </ChartContainer>
  );
};

// Gráfico combinado
export const ComposedAnalyticsChart = ({
  data,
  lines,
  bars,
  areas,
  title,
  subtitle,
  loading,
  height = 300
}) => {
  const theme = useTheme();

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
        <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
        <YAxis stroke={theme.palette.text.secondary} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
        />
        <Legend />

        {areas?.map((area, index) => (
          <Area
            key={`area-${area.dataKey}`}
            type="monotone"
            dataKey={area.dataKey}
            fill={alpha(area.color || theme.palette.primary.main, 0.3)}
            stroke={area.color || theme.palette.primary.main}
            name={area.name}
          />
        ))}

        {bars?.map((bar, index) => (
          <Bar
            key={`bar-${bar.dataKey}`}
            dataKey={bar.dataKey}
            fill={bar.color || theme.palette.secondary.main}
            name={bar.name}
          />
        ))}

        {lines?.map((line, index) => (
          <Line
            key={`line-${line.dataKey}`}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color || theme.palette.error.main}
            strokeWidth={2}
            name={line.name}
          />
        ))}
      </ComposedChart>
    </ChartContainer>
  );
};

// Gráfico de dispersão
export const ScatterAnalyticsChart = ({
  data,
  title,
  subtitle,
  loading,
  height = 300,
  xKey = 'x',
  yKey = 'y'
}) => {
  const theme = useTheme();

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <ScatterChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
        <XAxis type="number" dataKey={xKey} stroke={theme.palette.text.secondary} />
        <YAxis type="number" dataKey={yKey} stroke={theme.palette.text.secondary} />
        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Dados" dataKey={yKey} fill={theme.palette.primary.main} />
      </ScatterChart>
    </ChartContainer>
  );
};

// Gráfico radial de barras
export const RadialBarAnalyticsChart = ({
  data,
  title,
  subtitle,
  loading,
  height = 300
}) => {
  const theme = useTheme();

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={data}>
        <RadialBar
          minAngle={15}
          label={{ position: 'insideStart', fill: '#fff' }}
          background
          clockWise
          dataKey="value"
          fill={theme.palette.primary.main}
        />
        <Legend iconSize={18} layout="vertical" verticalAlign="middle" align="right" />
        <RechartsTooltip />
      </RadialBarChart>
    </ChartContainer>
  );
};

// Treemap para hierarquia de dados
export const TreemapChart = ({
  data,
  title,
  subtitle,
  loading,
  height = 300
}) => {
  const theme = useTheme();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Verificar se data existe e é um array válido
  const safeData = Array.isArray(data) ? data : [];

  if (!safeData.length) {
    return (
      <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'text.secondary'
          }}
        >
          <Typography>Nenhum dado disponível</Typography>
        </Box>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <Treemap
        data={safeData}
        dataKey="size"
        ratio={4/3}
        stroke={theme.palette.background.paper}
        fill={theme.palette.primary.main}
      >
        {safeData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Treemap>
    </ChartContainer>
  );
};

// Funil de conversão
export const FunnelAnalyticsChart = ({
  data,
  title,
  subtitle,
  loading,
  height = 300
}) => {
  const theme = useTheme();

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <FunnelChart>
        <RechartsTooltip />
        <Funnel
          dataKey="value"
          data={data}
          isAnimationActive
          fill={theme.palette.primary.main}
        >
          <LabelList position="center" fill="#fff" stroke="none" />
        </Funnel>
      </FunnelChart>
    </ChartContainer>
  );
};

// KPI Card com indicadores
export const KPICard = ({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  color = 'primary',
  subtitle,
  trend
}) => {
  const theme = useTheme();

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(val);
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    return val?.toLocaleString('pt-BR');
  };

  const calculateTrend = () => {
    if (!previousValue || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(change),
      positive: change > 0,
      text: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    };
  };

  const trendData = trend || calculateTrend();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {Icon && (
            <Icon
              sx={{
                fontSize: 24,
                color: `${color}.main`
              }}
            />
          )}
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main`, mb: 1 }}>
          {formatValue(value)}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}

        {trendData && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trendData.positive ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trendData.positive ? 'success.main' : 'error.main',
                fontWeight: 600
              }}
            >
              {trendData.text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs período anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Heatmap simples
export const HeatmapChart = ({
  data,
  title,
  subtitle,
  loading,
  height = 300,
  xKey = 'x',
  yKey = 'y',
  valueKey = 'value'
}) => {
  const theme = useTheme();

  // Verificar se data existe e é um array válido
  const safeData = Array.isArray(data) ? data : [];

  if (!safeData.length) {
    return (
      <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'text.secondary'
          }}
        >
          <Typography>Nenhum dado disponível</Typography>
        </Box>
      </ChartContainer>
    );
  }

  const maxValue = Math.max(...safeData.map(d => d[valueKey] || 0));

  return (
    <ChartContainer title={title} subtitle={subtitle} loading={loading} height={height}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.sqrt(safeData.length)}, 1fr)`,
        gap: 1,
        p: 2
      }}>
        {safeData.map((item, index) => {
          const intensity = (item[valueKey] || 0) / maxValue;
          return (
            <Box
              key={index}
              sx={{
                aspectRatio: '1',
                backgroundColor: alpha(theme.palette.primary.main, intensity),
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: intensity > 0.5 ? 'white' : theme.palette.text.primary,
                fontSize: '0.75rem',
                fontWeight: 600
              }}
              title={`${item[xKey]} - ${item[yKey]}: ${item[valueKey]}`}
            >
              {item[valueKey]}
            </Box>
          );
        })}
      </Box>
    </ChartContainer>
  );
};