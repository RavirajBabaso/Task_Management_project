import React from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';

interface TaskStatusData {
  name: string;
  value: number;
  color: string;
}

interface TaskStatusPieChartProps {
  data: TaskStatusData[];
}

const TaskStatusPieChart: React.FC<TaskStatusPieChartProps> = ({ data }) => {
  const totalTasks = data.reduce((sum, item) => sum + item.value, 0);

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex justify-center space-x-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center space-x-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-gray-700">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg font-semibold text-gray-800"
        >
          {totalTasks}
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm text-gray-600"
        >
          Total Tasks
        </text>
      </PieChart>
      <Legend content={renderLegend} />
    </div>
  );
};

export default TaskStatusPieChart;