"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoleManagement } from '@/components/behavior-scorecard/role-management'
import { MetricVisibilitySettings } from '@/components/behavior-scorecard/metric-visibility-settings'
import { Settings, Users } from 'lucide-react'
import { type ScorecardRole } from '@/lib/behavior-scorecard'

interface EnhancedRoleManagementProps {
  roles: Array<{ id: string; name: ScorecardRole; metrics: any[] }>
  onRoleChange?: () => void
}

export function EnhancedRoleManagement({ roles, onRoleChange }: EnhancedRoleManagementProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    roles.length > 0 ? roles[0].id : null
  )

  const selectedRole = roles.find(r => r.id === selectedRoleId)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="bg-m8bs-card p-1 border border-m8bs-border rounded-lg shadow-lg grid w-full grid-cols-2">
          <TabsTrigger 
            value="roles" 
            className="flex items-center gap-2 data-[state=active]:bg-m8bs-blue data-[state=active]:text-white text-white/70 data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            <Users className="h-4 w-4" />
            Manage Roles
          </TabsTrigger>
          <TabsTrigger 
            value="metrics" 
            className="flex items-center gap-2 data-[state=active]:bg-m8bs-blue data-[state=active]:text-white text-white/70 data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            <Settings className="h-4 w-4" />
            Customize Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <RoleManagement roles={roles} onRoleChange={onRoleChange} />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-m8bs-blue" />
                Customize Monthly Statistics Display
              </CardTitle>
              <CardDescription className="text-m8bs-muted">
                Select a role to customize which metrics are visible in the monthly statistics display
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roles.length === 0 ? (
                <div className="text-center py-8 text-m8bs-muted">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No roles available. Add roles in the "Manage Roles" tab first.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedRoleId === role.id
                            ? 'border-m8bs-blue bg-m8bs-blue/10'
                            : 'border-m8bs-border bg-m8bs-card-alt hover:border-m8bs-blue/50'
                        }`}
                      >
                        <div className="font-semibold text-white mb-1">{role.name}</div>
                        <div className="text-xs text-m8bs-muted">
                          {role.metrics.length} {role.metrics.length === 1 ? 'metric' : 'metrics'}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedRole && (
                    <div className="mt-6">
                      <div className="mb-4 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-m8bs-blue" />
                          <h3 className="font-semibold text-white">Selected: {selectedRole.name}</h3>
                        </div>
                        <p className="text-sm text-m8bs-muted">
                          Manage metrics, visibility settings, and goals for this role below.
                        </p>
                      </div>
                      <MetricVisibilitySettings
                        roleId={selectedRole.id}
                        roleName={selectedRole.name}
                        onSave={async () => {
                          if (onRoleChange) {
                            await onRoleChange()
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
