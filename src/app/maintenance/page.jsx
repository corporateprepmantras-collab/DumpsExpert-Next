// app/maintenance/page.js
import MaintenancePage from "@/components/public/MaintenancePage";

export default async function Page() {
  let maintenanceData = null;
  try {
    const res = await fetch("http://localhost:3000/api/maintenance-page", {
      cache: "no-store",
    });
    if (res.ok) {
      maintenanceData = await res.json();
    }
  } catch (e) {
    console.error("Error fetching maintenance:", e);
  }

  return (
    <MaintenancePage
      text={
        maintenanceData?.maintenanceText ||
        "We’re upgrading our site. Please check back soon."
      }
      imageUrl={maintenanceData?.imageUrl || null}
    />
  );
}
