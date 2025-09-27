import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your application dashboard
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started with common tasks
          </p>
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              Create New Project
            </Button>
            <Button className="w-full" variant="outline">
              View Reports
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your latest actions and updates
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>New user registered</span>
              <span className="text-muted-foreground">2h ago</span>
            </li>
            <li className="flex justify-between">
              <span>Report generated</span>
              <span className="text-muted-foreground">5h ago</span>
            </li>
            <li className="flex justify-between">
              <span>Settings updated</span>
              <span className="text-muted-foreground">1d ago</span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-2">System Status</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Current system health and metrics
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Server Status</span>
              <span className="text-green-600 text-sm font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Database</span>
              <span className="text-green-600 text-sm font-medium">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Status</span>
              <span className="text-green-600 text-sm font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
