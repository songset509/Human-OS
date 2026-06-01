import { AppLayout } from "@/components/layout/app-layout";
import { DemoBanner } from "@/components/layout/demo-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <DemoBanner />
      {children}
    </AppLayout>
  );
}
