import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  MessageSquare, 
  Mail, 
  Send, 
  Users,
  Repeat,
  CheckCircle2,
  Sparkles
} from "lucide-react";

const CAMPAIGNS = [
  { id: 1, name: "Winter Service Special", type: "Email + SMS", status: "Active", sent: 1250, openRate: "45%", conversion: "12%", revenue: "$4,500" },
  { id: 2, name: "Oil Change Reminder (3 Months)", type: "SMS", status: "Automated", sent: 85, openRate: "92%", conversion: "28%", revenue: "$1,200" },
  { id: 3, name: "We Miss You (Inactive > 6mo)", type: "Email", status: "Paused", sent: 450, openRate: "32%", conversion: "5%", revenue: "$850" },
];

export default function CRM() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">CRM & Marketing</h1>
            <p className="text-muted-foreground">Automated campaigns, customer lifecycle management, and engagement.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover-elevate transition-all border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">4</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Messages Sent (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">3,450</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Open Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-green-500">68%</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Generated Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-primary">$12,450</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Performance metrics for active and recent marketing pushes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CAMPAIGNS.map((campaign) => (
                <div key={campaign.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {campaign.type.includes("Email") ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold">{campaign.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] h-5">{campaign.type}</Badge>
                        <span>Sent: {campaign.sent}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-10">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Open Rate</div>
                      <div className="font-bold">{campaign.openRate}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Conversion</div>
                      <div className="font-bold">{campaign.conversion}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Revenue</div>
                      <div className="font-bold text-primary">{campaign.revenue}</div>
                    </div>
                    <div>
                      <Badge className={
                        campaign.status === "Active" ? "bg-green-500 hover:bg-green-600" : 
                        campaign.status === "Automated" ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500"
                      }>
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Automation Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Lifecycle Automations</CardTitle>
              <CardDescription>Always-on background triggers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "3-Month Oil Reminder", active: true },
                { name: "Declined Service Follow-up (3 Days)", active: true },
                { name: "Birthday Special", active: false },
                { name: "Review Request (Post-Service)", active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${item.active ? "bg-green-500" : "bg-gray-300"}`} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-black text-white border-none relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="h-32 w-32" />
              </div>
            <CardHeader>
              <CardTitle className="text-primary">AI Campaign Builder</CardTitle>
              <CardDescription className="text-gray-400">Let AI design your next promo.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 mb-6">
                Based on your shop history, AI suggests targeting **Audi owners** with a **Brake Fluid Flush** special. Estimated revenue: **$3,200**.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white border-none">
                <Sparkles className="mr-2 h-4 w-4" /> Generate Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
