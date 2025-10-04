"use client"

import { useState, useEffect } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  Save,
  Building,
  Clock,
  DollarSign,
  Printer,
  Bell,
  Shield
} from "lucide-react"

interface RestaurantSettings {
  _id?: string
  restaurantName: string
  address: string
  phone: string
  email: string
  gstNumber?: string
  currency: string
  timezone: string
  taxRate: number
  serviceCharge: number
  operatingHours: {
    open: string
    close: string
    isOpen24Hours: boolean
  }
  printerSettings: {
    kitchenPrinter: boolean
    billPrinter: boolean
    printerIP?: string
    printerPort?: number
    bluetoothEnabled?: boolean
    bluetoothName?: string
    bluetoothId?: string
    bleServiceUUID?: string
    bleCharacteristicUUID?: string
  }
  orderSettings: {
    autoAcceptOrders: boolean
    defaultPreparationTime: number
    maxOrdersPerTable: number
  }
  paymentMethods: {
    cash: boolean
    card: boolean
    upi: boolean
    online: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [scanning, setScanning] = useState(false)
  const [printers, setPrinters] = useState<string[]>([])
  const [printerScanError, setPrinterScanError] = useState('')
  const [blePreset, setBlePreset] = useState('')
  const [bleCandidates, setBleCandidates] = useState<Array<{ service: string; char: string; props: string[] }>>([])
  const [bleDiscovering, setBleDiscovering] = useState(false)

  // Common BLE printer presets
  const blePresets: Record<string, { name: string; service: string; char: string }> = {
    HM10: {
      name: 'HM-10 (FFE0/FFE1)',
      service: '0000ffe0-0000-1000-8000-00805f9b34fb',
      char: '0000ffe1-0000-1000-8000-00805f9b34fb'
    },
    FF00: {
      name: 'FF00 (FF02 write)',
      service: '0000ff00-0000-1000-8000-00805f9b34fb',
      char: '0000ff02-0000-1000-8000-00805f9b34fb'
    },
    FF01: {
      name: 'FF00 (FF01 write)',
      service: '0000ff00-0000-1000-8000-00805f9b34fb',
      char: '0000ff01-0000-1000-8000-00805f9b34fb'
    },
    F0F1: {
      name: '18F0 (2AF1 write)',
      service: '000018f0-0000-1000-8000-00805f9b34fb',
      char: '00002af1-0000-1000-8000-00805f9b34fb'
    },
    NUS: {
      name: 'Nordic UART (NUS)',
      service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      char: '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
    },
    ISSC: {
      name: 'ISSC SPP-like',
      service: '49535343-fe7d-4ae5-8fa9-9fafd205e455',
      char: '49535343-8841-43f4-a8d4-ecbe34729bb3'
    }
  }

  // Discover writable characteristics across common services
  const discoverBleWritable = async () => {
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      setError('Web Bluetooth not supported on this device/browser. Use Chrome on Android/desktop.')
      setTimeout(() => setError(''), 4000)
      return
    }
    setBleCandidates([])
    setBleDiscovering(true)
    try {
      const services = Object.values(blePresets).map(p => p.service)
      const nameFilter = settings?.printerSettings.bluetoothName
      const filters: any[] = []
      if (nameFilter) filters.push({ name: nameFilter })
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: filters.length ? filters : undefined,
        acceptAllDevices: filters.length === 0,
        optionalServices: services
      })
      const server = await device.gatt.connect()
      const found: Array<{ service: string; char: string; props: string[] }> = []
      for (const s of services) {
        try {
          const svc = await server.getPrimaryService(s)
          const chars = await svc.getCharacteristics()
          for (const c of chars) {
            const props = Object.entries(c.properties)
              .filter(([k, v]) => Boolean(v))
              .map(([k]) => k)
            if (c.properties?.write || c.properties?.writeWithoutResponse) {
              found.push({ service: s, char: c.uuid, props })
            }
          }
        } catch {}
      }
      setBleCandidates(found)
      if (found.length === 0) {
        setError('No writable BLE characteristics found on common services. Enter UUIDs from printer docs.')
        setTimeout(() => setError(''), 4000)
      }
    } catch (err: any) {
      if (err?.name !== 'NotFoundError') {
        setError(err?.message || 'BLE discovery failed')
        setTimeout(() => setError(''), 4000)
      }
    } finally {
      setBleDiscovering(false)
    }
  }

  // Helper: auto-detect common BLE service/characteristic UUIDs for BT printers
  const autoDetectBleUUIDs = async () => {
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      setError('Web Bluetooth not supported on this device/browser. Use Chrome on Android/desktop.')
      setTimeout(() => setError(''), 4000)
      return
    }
    try {
      const nameFilter = settings?.printerSettings.bluetoothName
      const filters: any[] = []
      if (nameFilter) filters.push({ name: nameFilter })
      // Common BLE printer services and likely write characteristics
      const candidates: { service: string; chars: string[] }[] = [
        { service: '000018f0-0000-1000-8000-00805f9b34fb', chars: ['00002af1-0000-1000-8000-00805f9b34fb'] },
        { service: '0000ff00-0000-1000-8000-00805f9b34fb', chars: ['0000ff02-0000-1000-8000-00805f9b34fb', '0000ff01-0000-1000-8000-00805f9b34fb'] },
        { service: '0000ffe0-0000-1000-8000-00805f9b34fb', chars: ['0000ffe1-0000-1000-8000-00805f9b34fb'] },
        { service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e', chars: ['6e400002-b5a3-f393-e0a9-e50e24dcca9e'] },
        { service: '49535343-fe7d-4ae5-8fa9-9fafd205e455', chars: ['49535343-8841-43f4-a8d4-ecbe34729bb3', '49535343-1e4d-4bd9-ba61-23c647249616'] },
      ]

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: filters.length ? filters : undefined,
        acceptAllDevices: filters.length === 0,
        optionalServices: candidates.map(c => c.service)
      })
      const server = await device.gatt.connect()

      let found: { service: string; char: string } | null = null
      for (const c of candidates) {
        try {
          const service = await server.getPrimaryService(c.service)
          for (const ch of c.chars) {
            try {
              await service.getCharacteristic(ch)
              found = { service: c.service, char: ch }
              break
            } catch {}
          }
          if (found) break
        } catch {}
      }

      if (found) {
        updateSettings('printerSettings.bleServiceUUID', found.service)
        updateSettings('printerSettings.bleCharacteristicUUID', found.char)
        if (device?.name) updateSettings('printerSettings.bluetoothName', device.name)
        if (device?.id) updateSettings('printerSettings.bluetoothId', device.id)
        setSuccess('Detected BLE Service/Characteristic. Save Changes to persist.')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Could not detect known BLE service/characteristic. Please enter manually from printer documentation.')
        setTimeout(() => setError(''), 4000)
      }
    } catch (err: any) {
      if (err?.name !== 'NotFoundError') {
        setError(err?.message || 'Auto-detect failed')
        setTimeout(() => setError(''), 4000)
      }
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
      } else {
        setError(result.error || 'Failed to fetch settings')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to save settings')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (path: string, value: any) => {
    if (!settings) return

    const keys = path.split('.')
    const newSettings = { ...settings }
    let current: any = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] }
      current = current[keys[i]]
    }

    current[keys[keys.length - 1]] = value
    setSettings(newSettings)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <DashboardHeader
          title="Settings"
          subtitle="Configure restaurant settings"
          showBackButton={true}
          onRefresh={fetchSettings}
        />

      <div className="px-4 py-4 space-y-4">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {settings && (
          <>
            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  saving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Restaurant Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Building className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Restaurant Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={settings.restaurantName}
                    onChange={(e) => updateSettings('restaurantName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => updateSettings('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => updateSettings('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSettings('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={settings.gstNumber || ''}
                    onChange={(e) => updateSettings('gstNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Business Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Business Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={settings.operatingHours.open}
                      onChange={(e) => updateSettings('operatingHours.open', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={settings.operatingHours.close}
                      onChange={(e) => updateSettings('operatingHours.close', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.taxRate}
                      onChange={(e) => updateSettings('taxRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service Charge (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.serviceCharge}
                      onChange={(e) => updateSettings('serviceCharge', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSettings('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Printer Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Printer className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Printer Settings</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="printer-ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Printer IP</label>
                    <input
                      id="printer-ip"
                      type="text"
                      value={settings.printerSettings.printerIP || ''}
                      onChange={(e) => updateSettings('printerSettings.printerIP', e.target.value)}
                      placeholder="e.g. 192.168.0.100"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="printer-port" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Printer Port</label>
                    <input
                      id="printer-port"
                      type="number"
                      value={settings.printerSettings.printerPort || 9100}
                      onChange={(e) => updateSettings('printerSettings.printerPort', parseInt(e.target.value || '9100', 10))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!settings?.printerSettings?.printerIP) {
                        setError('Please set Printer IP first or use Find Printers.');
                        setTimeout(() => setError(''), 3000)
                        return;
                      }
                      try {
                        const res = await fetch('/api/print', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            printerIp: settings.printerSettings.printerIP,
                            printerPort: settings.printerSettings.printerPort || 9100
                          })
                        });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.error || 'Test print failed');
                        setSuccess('Test print sent successfully');
                        setTimeout(() => setSuccess(''), 3000);
                      } catch (e: any) {
                        setError(e.message || 'Test print failed');
                        setTimeout(() => setError(''), 4000);
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Test Print
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setPrinterScanError('')
                        setScanning(true)
                        const res = await fetch('/api/print/scan')
                        const data = await res.json()
                        if (!data.success) throw new Error(data.error || 'Scan failed')
                        setPrinters(Array.isArray(data.printers) ? data.printers : [])
                      } catch (e: any) {
                        setPrinterScanError(e.message || 'Scan failed')
                        setPrinters([])
                      } finally {
                        setScanning(false)
                      }
                    }}
                    className={`px-4 py-2 rounded-lg ${scanning ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'}`}
                    disabled={scanning}
                    title="Scan local network for printers on port 9100"
                  >
                    {scanning ? 'Scanning…' : 'Find Printers'}
                  </button>
                  <span className="text-xs text-gray-500">Ensure your phone/server is on same WiFi as printer.</span>
                </div>

                {printerScanError && (
                  <div className="text-sm text-red-600">{printerScanError}</div>
                )}
                {printers.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <label htmlFor="printer-select" className="text-sm text-gray-700 dark:text-gray-300">Detected:</label>
                    <select
                      id="printer-select"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onChange={(e) => updateSettings('printerSettings.printerIP', e.target.value)}
                      value={settings.printerSettings.printerIP || ''}
                    >
                      <option value="">Select printer IP</option>
                      {printers.map(ip => (
                        <option key={ip} value={ip}>{ip}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setSuccess('Printer IP selected. Remember to Save Changes.')} 
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >Apply</button>
                  </div>
                )}

                {/* Bluetooth Printer Settings */}
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Bluetooth Printer</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      id="bt-enabled"
                      type="checkbox"
                      checked={!!settings.printerSettings.bluetoothEnabled}
                      onChange={(e) => updateSettings('printerSettings.bluetoothEnabled', e.target.checked)}
                    />
                    <label htmlFor="bt-enabled" className="text-sm text-gray-700 dark:text-gray-300">Enable Bluetooth printer</label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="bt-preset" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quick Presets</label>
                      <div className="flex items-center gap-2">
                        <select
                          id="bt-preset"
                          value={blePreset}
                          onChange={(e) => setBlePreset(e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select a common profile…</option>
                          {Object.entries(blePresets).map(([key, p]) => (
                            <option key={key} value={key}>{p.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!blePreset) return
                            const p = blePresets[blePreset]
                            updateSettings('printerSettings.bleServiceUUID', p.service)
                            updateSettings('printerSettings.bleCharacteristicUUID', p.char)
                            setSuccess('Applied preset. Save Changes to persist.')
                            setTimeout(() => setSuccess(''), 2500)
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >Apply</button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="bt-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Name (optional)</label>
                      <input
                        id="bt-name"
                        type="text"
                        value={settings.printerSettings.bluetoothName || ''}
                        onChange={(e) => updateSettings('printerSettings.bluetoothName', e.target.value)}
                        placeholder="e.g. BT-Printer-58mm"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="bt-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device ID / MAC (optional)</label>
                      <input
                        id="bt-id"
                        type="text"
                        value={settings.printerSettings.bluetoothId || ''}
                        onChange={(e) => updateSettings('printerSettings.bluetoothId', e.target.value)}
                        placeholder="e.g. 00:11:22:33:44:55"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="bt-service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BLE Service UUID (Web Bluetooth)</label>
                      <input
                        id="bt-service"
                        type="text"
                        value={settings.printerSettings.bleServiceUUID || ''}
                        onChange={(e) => updateSettings('printerSettings.bleServiceUUID', e.target.value)}
                        placeholder="e.g. 000018f0-0000-1000-8000-00805f9b34fb"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="bt-char" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BLE Characteristic UUID</label>
                      <input
                        id="bt-char"
                        type="text"
                        value={settings.printerSettings.bleCharacteristicUUID || ''}
                        onChange={(e) => updateSettings('printerSettings.bleCharacteristicUUID', e.target.value)}
                        placeholder="e.g. 00002af1-0000-1000-8000-00805f9b34fb"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={async () => {
                        if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
                          setError('Web Bluetooth not supported on this device/browser. Use Chrome on Android/desktop.');
                          setTimeout(() => setError(''), 4000);
                          return;
                        }
                        try {
                          const filters: any[] = [];
                          if (settings?.printerSettings.bluetoothName) {
                            filters.push({ name: settings.printerSettings.bluetoothName });
                          }
                          const optionalServices = [] as any[];
                          if (settings?.printerSettings.bleServiceUUID) {
                            optionalServices.push(settings.printerSettings.bleServiceUUID);
                          }
                          const device = await (navigator as any).bluetooth.requestDevice({ filters: filters.length ? filters : undefined, acceptAllDevices: filters.length === 0, optionalServices });
                          updateSettings('printerSettings.bluetoothName', device?.name || settings?.printerSettings.bluetoothName || '')
                          updateSettings('printerSettings.bluetoothId', device?.id || settings?.printerSettings.bluetoothId || '')
                          setSuccess('Bluetooth device selected. Save Changes to persist.');
                          setTimeout(() => setSuccess(''), 3000);
                        } catch (err: any) {
                          if (err?.name !== 'NotFoundError') {
                            setError(err?.message || 'Bluetooth selection failed');
                            setTimeout(() => setError(''), 4000);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                    >
                      Pair Bluetooth
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!settings?.printerSettings.bluetoothEnabled) {
                          setError('Enable Bluetooth printer first.');
                          setTimeout(() => setError(''), 3000);
                          return;
                        }
                        if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
                          setError('Web Bluetooth not supported on this device/browser. Use Chrome on Android/desktop.');
                          setTimeout(() => setError(''), 4000);
                          return;
                        }
                        const serviceUUID = settings?.printerSettings.bleServiceUUID;
                        const charUUID = settings?.printerSettings.bleCharacteristicUUID;
                        if (!serviceUUID || !charUUID) {
                          setError('Set BLE Service and Characteristic UUIDs to use Bluetooth printing.');
                          setTimeout(() => setError(''), 4000);
                          return;
                        }
                        try {
                          const filters: any[] = [];
                          if (settings?.printerSettings.bluetoothName) {
                            filters.push({ name: settings.printerSettings.bluetoothName });
                          }
                          const device = await (navigator as any).bluetooth.requestDevice({
                            filters: filters.length ? filters : undefined,
                            acceptAllDevices: filters.length === 0,
                            optionalServices: [serviceUUID]
                          });
                          const server = await device.gatt.connect();
                          const service = await server.getPrimaryService(serviceUUID);
                          const characteristic = await service.getCharacteristic(charUUID);

                          // Build a small ESC/POS test receipt for 58mm
                          const ESC = 0x1b; const GS = 0x1d; const LF = 0x0a;
                          const enc = new TextEncoder();
                          function txt(t: string) { return Array.from(enc.encode(t)); }
                          const bytes: number[] = [];
                          bytes.push(ESC, 0x40); // init
                          bytes.push(ESC, 0x61, 0x01); // center
                          bytes.push(...txt('*** TEST RECEIPT ***\n'));
                          bytes.push(...txt('POSBillApp (BT)\n'));
                          bytes.push(...txt('-----------------------------\n'));
                          bytes.push(...txt('Hello from Web Bluetooth!\n'));
                          bytes.push(...txt('Date: ' + new Date().toLocaleString() + '\n'));
                          bytes.push(...txt('-----------------------------\n'));
                          bytes.push(LF, LF, LF);
                          // Partial cut (some BT printers ignore cut over BLE)
                          bytes.push(GS, 0x56, 0x01);

                          await characteristic.writeValue(new Uint8Array(bytes));
                          setSuccess('Bluetooth test receipt sent.');
                          setTimeout(() => setSuccess(''), 3000);
                        } catch (err: any) {
                          if (err?.name !== 'NotFoundError') {
                            setError(err?.message || 'Bluetooth print failed');
                            setTimeout(() => setError(''), 4000);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                    >
                      Test Bluetooth Print
                    </button>
                    <button
                      type="button"
                      onClick={autoDetectBleUUIDs}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg"
                    >
                      Auto-detect BLE UUIDs
                    </button>
                    <span className="text-xs text-gray-500">Web Bluetooth works on Chrome/Edge (Desktop/Android), not iOS Safari.</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </ProtectedRoute>
  )
}


