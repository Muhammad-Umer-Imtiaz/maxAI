'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import { RequirePlanAccess } from '../../lib/RequirePlanAccess'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/(frontend)/components/ui/card'
import { Alert, AlertDescription } from '@/app/(frontend)/components/ui/alert'
import {
  User,
  Mail,
  CreditCard,
  Shield,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Name editing state
  const [editingName, setEditingName] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')

  // Password changing state
  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
  }, [user])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleUpdateName = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setMessage({ type: 'error', text: 'Both first and last name are required' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update name')
      }

      setMessage({ type: 'success', text: 'Name updated successfully' })
      setEditingName(false)

      // Refresh the page to update user context
      window.location.reload()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update name',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password')
      }

      setMessage({ type: 'success', text: 'Password changed successfully' })
      setChangingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to change password',
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelNameEdit = () => {
    setFirstName(user?.firstName || '')
    setLastName(user?.lastName || '')
    setEditingName(false)
  }

  const cancelPasswordChange = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setChangingPassword(false)
  }

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'free':
        return { name: 'Free Plan', color: 'bg-gray-500', calls: '1 AI call' }
      case 'starter':
        return { name: 'Starter Plan', color: 'bg-blue-500', calls: '5 AI calls' }
      case 'proFit':
        return { name: 'ProFit Plan', color: 'bg-purple-500', calls: '20 AI calls' }
      case 'maxFlex':
        return {
          name: 'MaxFlex Plan',
          color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          calls: 'Unlimited calls',
        }
      default:
        return { name: 'Unknown Plan', color: 'bg-gray-500', calls: 'Unknown' }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
      </div>
    )
  }

  const planDetails = getPlanDetails(user.plan)

  return (
    <RequirePlanAccess>
      <div className="min-h-screen bg-hero-gradient p-3 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-maxfit-neon-green/20 rounded-lg flex-shrink-0">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-maxfit-neon-green" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-maxfit-white truncate">
                  Settings
                </h1>
                <p className="text-sm sm:text-base text-maxfit-medium-grey">
                  Manage your account preferences
                </p>
              </div>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <Alert
              variant={message.type === 'error' ? 'destructive' : 'default'}
              className="mx-1 sm:mx-0"
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="text-sm">{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Information */}
            <Card className="glass-card border-maxfit-medium-grey/20 order-1">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-maxfit-white text-lg sm:text-xl">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green flex-shrink-0" />
                  <span className="truncate">Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-maxfit-white flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>Email Address</span>
                  </label>
                  <Input
                    value={user.email}
                    disabled
                    className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-medium-grey text-sm sm:text-base"
                  />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">First Name</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!editingName}
                      className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white disabled:text-maxfit-medium-grey text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">Last Name</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!editingName}
                      className="bg-maxfit-darker-grey/50 border-maxfit-medium-grey/30 text-maxfit-white disabled:text-maxfit-medium-grey text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Name Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {!editingName ? (
                    <Button
                      onClick={() => setEditingName(true)}
                      variant="outline"
                      className="w-full sm:w-auto border-maxfit-neon-green text-maxfit-neon-green hover:bg-maxfit-neon-green hover:text-black text-sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Name
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleUpdateName}
                        disabled={loading}
                        className="btn-neon w-full sm:w-auto text-sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={cancelNameEdit}
                        variant="ghost"
                        className="w-full sm:w-auto text-maxfit-medium-grey hover:text-maxfit-white text-sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Plan */}
            <Card className="glass-card border-maxfit-medium-grey/20 order-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-maxfit-white text-lg sm:text-xl">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green flex-shrink-0" />
                  <span className="truncate">Current Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <div className="p-4 rounded-xl bg-maxfit-darker-grey/50 border border-maxfit-medium-grey/20">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className="text-base sm:text-lg font-semibold text-maxfit-white">
                      {planDetails.name}
                    </span>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${planDetails.color} flex-shrink-0`}
                    >
                      Active
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-maxfit-medium-grey">AI Calls Used:</span>
                      <span className="text-maxfit-white font-medium">{user.aiCallsUsed || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-maxfit-medium-grey">Max AI Calls:</span>
                      <span className="text-maxfit-white font-medium">
                        {user.maxAiCalls === -1 ? 'Unlimited' : user.maxAiCalls || 1}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-maxfit-medium-grey">Plan Features:</span>
                      <span className="text-maxfit-neon-green font-medium">
                        {planDetails.calls}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => window.open('/#pricing', '_blank')}
                  className="w-full btn-outline-neon text-sm"
                >
                  Change Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Section */}
          <Card className="glass-card border-maxfit-medium-grey/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-3 text-maxfit-white text-lg sm:text-xl">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green flex-shrink-0" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              {!changingPassword ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-maxfit-darker-grey/50 border border-maxfit-medium-grey/20 gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-maxfit-white font-medium">Password</div>
                    <div className="text-maxfit-medium-grey text-sm">
                      Last changed: Not available
                    </div>
                  </div>
                  <Button
                    onClick={() => setChangingPassword(true)}
                    variant="outline"
                    className="w-full sm:w-auto border-maxfit-neon-green text-maxfit-neon-green hover:bg-maxfit-neon-green hover:text-black text-sm flex-shrink-0"
                  >
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4 rounded-xl bg-maxfit-darker-grey/50 border border-maxfit-medium-grey/20">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-maxfit-darker-grey border-maxfit-medium-grey/30 text-maxfit-white pr-10 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-maxfit-medium-grey hover:text-maxfit-white"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">New Password</label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-maxfit-darker-grey border-maxfit-medium-grey/30 text-maxfit-white pr-10 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-maxfit-medium-grey hover:text-maxfit-white"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-maxfit-white">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-maxfit-darker-grey border-maxfit-medium-grey/30 text-maxfit-white pr-10 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-maxfit-medium-grey hover:text-maxfit-white"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="btn-neon w-full sm:w-auto text-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                    <Button
                      onClick={cancelPasswordChange}
                      variant="ghost"
                      className="w-full sm:w-auto text-maxfit-medium-grey hover:text-maxfit-white text-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RequirePlanAccess>
  )
}
