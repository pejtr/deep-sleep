import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trpc } from '@/lib/trpc';

interface Campaign {
  id: string;
  name: string;
  platform: 'meta' | 'organic' | 'google';
  status: 'active' | 'paused' | 'scheduled';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
  startDate: Date;
  endDate?: Date;
  lunaContent?: string;
}

export function CampaignDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const { data: campaignData, isLoading } = trpc.campaigns.list.useQuery();
  const createCampaign = trpc.campaigns.create.useMutation();

  useEffect(() => {
    if (campaignData) {
      setCampaigns(campaignData);
    }
  }, [campaignData]);

  const handleCreateCampaign = async () => {
    const newCampaign = {
      name: 'Luna Voss - Sleep Transformation',
      platform: 'meta' as const,
      budget: 1000,
      lunaContent: '/manus-storage/luna-voss-1-sleep-transformation_c6898099.png',
    };
    
    try {
      await createCampaign.mutateAsync(newCampaign);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgROI = campaigns.length > 0 
    ? (campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length).toFixed(1)
    : '0';

  const chartData = campaigns.map(c => ({
    name: c.name.substring(0, 15),
    spent: c.spent,
    conversions: c.conversions,
    roi: c.roi,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Celkové výdaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Konverze</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Průměrný ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgROI}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktivní kampaně</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Výkon kampaní</CardTitle>
          <CardDescription>ROI a konverze podle kampaně</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="roi" fill="#f59e0b" />
              <Bar dataKey="conversions" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Kampaně</CardTitle>
              <CardDescription>Luna Voss influencer kampaně</CardDescription>
            </div>
            <Button onClick={handleCreateCampaign} disabled={createCampaign.isPending}>
              {createCampaign.isPending ? 'Vytváření...' : 'Nová kampaň'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div>Načítání...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-center text-gray-500">Žádné kampaně</div>
            ) : (
              campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{campaign.name}</div>
                    <div className="text-sm text-gray-500">
                      {campaign.platform} • {campaign.impressions} impressions • {campaign.clicks} clicks
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status === 'active' ? 'Aktivní' : campaign.status === 'paused' ? 'Pozastaveno' : 'Naplánováno'}
                    </Badge>
                    <div className="text-sm font-medium">
                      ${campaign.spent.toFixed(2)} / ${campaign.budget.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${campaign.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ROI: {campaign.roi.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
