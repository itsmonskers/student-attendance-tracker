import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, stringToColor } from "@/lib/utils";

interface AvatarWithTextProps {
  firstName: string;
  lastName: string;
  subtitle?: string;
  avatarClassName?: string;
  textClassName?: string;
}

export function AvatarWithText({
  firstName,
  lastName,
  subtitle,
  avatarClassName = "h-10 w-10",
  textClassName = "ml-4",
}: AvatarWithTextProps) {
  const initials = getInitials(firstName, lastName);
  const backgroundColor = stringToColor(`${firstName} ${lastName}`);
  
  return (
    <div className="flex items-center">
      <Avatar className={avatarClassName} style={{ backgroundColor }}>
        <AvatarFallback className="text-white font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className={textClassName}>
        <div className="text-sm font-medium text-neutral-500">
          {firstName} {lastName}
        </div>
        {subtitle && <div className="text-xs text-neutral-400">{subtitle}</div>}
      </div>
    </div>
  );
}
