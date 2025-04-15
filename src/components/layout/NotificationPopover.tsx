import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";

export function NotificationPopover({ notifications }: { notifications: any[] }) {
  return (
    <Popover>
      <PopoverTrigger>
        <Bell className="text-foreground cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="max-w-sm">
        <h3 className="font-bold">Notifications</h3>
        <div className="mt-2">
          {notifications.length === 0 && <p className="text-muted-foreground">No notifications</p>}
          {notifications.map((notification) => (
            <div key={notification.id} className="py-2 border-b last:border-0">
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-muted-foreground">{notification.date}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
