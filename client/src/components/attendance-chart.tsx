import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface AttendanceChartProps {
  data: any[];
  isLoading: boolean;
}

export default function AttendanceChart({ data, isLoading }: AttendanceChartProps) {
  const [timeRange, setTimeRange] = useState("This Week");
  
  // Format data for the chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { weekday: 'short' }),
    Present: item.present,
    Late: item.late,
    Absent: item.absent,
  }));
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-neutral-200 rounded-md shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value} students
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-neutral-500">Weekly Attendance Overview</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="This Week">This Week</SelectItem>
            <SelectItem value="Last Week">Last Week</SelectItem>
            <SelectItem value="This Month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-neutral-500">Loading data...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-neutral-500">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                barSize={16}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" scale="point" padding={{ left: 20, right: 20 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Present" name="Present" stackId="a" fill="#4caf50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" name="Late" stackId="a" fill="#ff9800" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Absent" name="Absent" stackId="a" fill="#f44336" radius={[0, 0, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="flex justify-center mt-2">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-success rounded-sm mr-1"></div>
            <span className="text-xs text-neutral-500">Present</span>
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-warning rounded-sm mr-1"></div>
            <span className="text-xs text-neutral-500">Late</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-destructive rounded-sm mr-1"></div>
            <span className="text-xs text-neutral-500">Absent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
