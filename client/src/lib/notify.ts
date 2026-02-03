import { toast as toastController } from "@/hooks/use-toast";

type NotifyOpts = {
  title: string;
  description?: string;
  id?: string;
};

export function notifySuccess({ title, description }: NotifyOpts) {
  return toastController({
    title,
    description,
    // subtle green styling for success
    className: "bg-emerald-600 text-white border-emerald-700",
  });
}

export function notifyError({ title, description }: NotifyOpts) {
  return toastController({
    title,
    description,
    // destructive variant styling handled via className
    className: "bg-red-600 text-white border-red-700",
  });
}

export function notifyInfo({ title, description }: NotifyOpts) {
  return toastController({
    title,
    description,
    className: "bg-slate-800 text-white border-slate-700",
  });
}

export default { notifySuccess, notifyError, notifyInfo };
