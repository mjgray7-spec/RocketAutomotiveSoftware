import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Wrench, RefreshCw } from "lucide-react";
import type { PmService } from "@shared/schema";

export default function SettingsPage() {
  const [pmServices, setPmServices] = useState<PmService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchPmServices = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/pm-services");
      if (response.ok) {
        const data = await response.json();
        setPmServices(data);
      }
    } catch (error) {
      console.error("Failed to fetch PM services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPmServices();
  }, []);

  const toggleService = async (id: number, enabled: boolean) => {
    setSaving(id);
    try {
      const response = await fetch(`/api/pm-services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (response.ok) {
        setPmServices(pmServices.map(s => 
          s.id === id ? { ...s, enabled } : s
        ));
      }
    } catch (error) {
      console.error("Failed to update PM service:", error);
    } finally {
      setSaving(null);
    }
  };

  const seedPmServices = async () => {
    setLoading(true);
    try {
      await fetch("/api/pm-services/seed", { method: "POST" });
      await fetchPmServices();
    } catch (error) {
      console.error("Failed to seed PM services:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Settings className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">Manage shop configuration and preferences</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  PM Services
                </CardTitle>
                <CardDescription>
                  Toggle which preventive maintenance services appear in the new repair order form
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchPmServices}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pmServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No PM services found</p>
                <Button onClick={seedPmServices}>
                  Seed Default PM Services
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pmServices.map((service) => (
                  <div 
                    key={service.id} 
                    className="flex items-center justify-between py-3 border-b last:border-0"
                    data-testid={`pm-service-row-${service.id}`}
                  >
                    <div>
                      <Label 
                        htmlFor={`service-${service.id}`}
                        className="text-base font-medium cursor-pointer"
                      >
                        {service.name}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      {saving === service.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      <Switch 
                        id={`service-${service.id}`}
                        checked={service.enabled}
                        onCheckedChange={(checked) => toggleService(service.id, checked)}
                        disabled={saving === service.id}
                        data-testid={`switch-pm-service-${service.id}`}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">
                  {pmServices.filter(s => s.enabled).length} of {pmServices.length} services enabled
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
