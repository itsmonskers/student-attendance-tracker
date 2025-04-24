import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  titleClassName?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconClassName,
  valueClassName,
  titleClassName,
}: StatCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={cn("rounded-full bg-opacity-20 p-3", iconClassName)}>
            {icon}
          </div>
          <div className="ml-4">
            <h3 className={cn("text-sm font-medium text-neutral-400", titleClassName)}>
              {title}
            </h3>
            <p className={cn("text-2xl font-medium text-neutral-500", valueClassName)}>
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
