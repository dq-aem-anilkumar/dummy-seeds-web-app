
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const MasterDataPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
        <p className="text-gray-600">System configuration and master data management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-3">🏷️</span>
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage product categories and classifications</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-3">🚚</span>
              Delivery Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Configure delivery areas and shipping zones</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-3">💰</span>
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage payment gateways and methods</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-3">⚙️</span>
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Configure system-wide settings and preferences</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Analytics Config
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Configure analytics and reporting parameters</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-3">🔐</span>
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Manage security policies and access controls</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">v2.1.0</div>
              <div className="text-sm text-blue-600">System Version</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-green-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2.5GB</div>
              <div className="text-sm text-purple-600">Database Size</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
