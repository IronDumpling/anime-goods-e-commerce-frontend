import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

export function Modal({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="bg-surface text-foreground rounded-md">
        {children}
      </DialogContent>
    </Dialog>
  );
}
