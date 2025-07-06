import React, { useState, useEffect } from 'react'
import { Plus, Send, Bell, Mail, MessageSquare, Settings } from 'lucide-react'
import { notificationService, memberService } from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [members, setMembers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSendModal, setShowSendModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()

  const notificationType = watch('type')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [notificationsRes, membersRes, statsRes] = await Promise.all([
        notificationService.getAll(),
        memberService.getAll(),
        notificationService.getStats()
      ])
      
      setNotifications(notificationsRes.data)
      setMembers(membersRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async (data) => {
    try {
      let notificationData = {
        memberId: data.recipient === 'all' ? null : parseInt(data.memberId),
        message: data.message,
        type: data.type,
        subject: data.subject || getDefaultSubject(data.type)
      }

      // Use specific endpoints for different notification types
      switch (data.type) {
        case 'DUE_REMINDER':
          await notificationService.createDueReminder(notificationData)
          break
        case 'OVERDUE_ALERT':
          await notificationService.createOverdueAlert(notificationData)
          break
        case 'FINE_NOTICE':
          await notificationService.createFineNotice(notificationData)
          break
        default:
          await notificationService.create(notificationData)
      }

      toast.success('Notification sent successfully!')
      setShowSendModal(false)
      reset()
      fetchData()
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const getDefaultSubject = (type) => {
    switch (type) {
      case 'DUE_REMINDER':
        return 'Book Due Reminder'
      case 'OVERDUE_ALERT':
        return 'Overdue Book Alert'
      case 'FINE_NOTICE':
        return 'Fine Notice'
      case 'WELCOME':
        return 'Welcome to the Library'
      default:
        return 'Library Notification'
    }
  }

  const getMemberName = (memberId) => {
    if (!memberId) return 'All Members'
    const member = members.find(m => m.id === memberId)
    return member ? member.name : `Member ID: ${memberId}`
  }

  const getMemberEmail = (memberId) => {
    if (!memberId) return ''
    const member = members.find(m => m.id === memberId)
    return member ? member.email : ''
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DUE_REMINDER':
        return <Bell className="h-4 w-4 text-yellow-600" />
      case 'OVERDUE_ALERT':
        return <Bell className="h-4 w-4 text-red-600" />
      case 'FINE_NOTICE':
        return <Mail className="h-4 w-4 text-orange-600" />
      case 'WELCOME':
        return <MessageSquare className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'sent':
        return notification.status === 'SENT'
      case 'pending':
        return notification.status === 'PENDING'
      case 'failed':
        return notification.status === 'FAILED'
      default:
        return true
    }
  })

  const columns = [
    {
      key: 'recipient',
      header: 'Recipient',
      accessor: 'memberId',
      render: (notification) => (
        <div>
          <div className="font-medium text-gray-900">{getMemberName(notification.memberId)}</div>
          <div className="text-sm text-gray-500">{getMemberEmail(notification.memberId)}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (notification) => (
        <div className="flex items-center space-x-2">
          {getTypeIcon(notification.type)}
          <span className="text-sm">{notification.type.replace('_', ' ')}</span>
        </div>
      )
    },
    {
      key: 'subject',
      header: 'Subject',
      accessor: 'subject',
      render: (notification) => (
        <div>
          <div className="font-medium text-gray-900">{notification.subject}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {notification.message}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (notification) => (
        <span className={`badge ${
          notification.status === 'SENT' ? 'badge-success' :
          notification.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
        }`}>
          {notification.status}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      render: (notification) => {
        if (!notification.createdAt) return '-';
        let date;
        try {
          date = parseISO(notification.createdAt);
        } catch (e) {
          return '-';
        }
        if (isNaN(date)) return '-';
        try {
          return format(date, 'MMM d, yyyy HH:mm');
        } catch (e) {
          return '-';
        }
      }
    }
  ]

  const tabs = [
    { key: 'all', label: 'All Notifications', count: notifications.length },
    { key: 'sent', label: 'Sent', count: notifications.filter(n => n.status === 'SENT').length },
    { key: 'pending', label: 'Pending', count: notifications.filter(n => n.status === 'PENDING').length },
    { key: 'failed', label: 'Failed', count: notifications.filter(n => n.status === 'FAILED').length }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Send and manage library notifications</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="btn btn-outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="btn btn-primary"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalSent || notifications.filter(n => n.status === 'SENT').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Mail className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalPending || notifications.filter(n => n.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalFailed || notifications.filter(n => n.status === 'FAILED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.thisMonth || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Notifications Table */}
        <div className="mt-6">
          <DataTable
            data={filteredNotifications}
            columns={columns}
            loading={loading}
            emptyMessage="No notifications found"
          />
        </div>
      </div>

      {/* Send Notification Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => {
          setShowSendModal(false)
          reset()
        }}
        title="Send Notification"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleSendNotification)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Type *
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="input-field"
              >
                <option value="">Select type</option>
                <option value="DUE_REMINDER">Due Reminder</option>
                <option value="OVERDUE_ALERT">Overdue Alert</option>
                <option value="FINE_NOTICE">Fine Notice</option>
                <option value="WELCOME">Welcome Message</option>
                <option value="GENERAL">General Announcement</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient *
              </label>
              <select
                {...register('recipient', { required: 'Recipient is required' })}
                className="input-field"
              >
                <option value="">Select recipient</option>
                <option value="all">All Members</option>
                {members.filter(m => m.membershipStatus === 'ACTIVE').map((member) => (
                  <option key={member.id || member.email || member.name} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              {errors.recipient && (
                <p className="text-red-500 text-xs mt-1">{errors.recipient.message}</p>
              )}
            </div>
          </div>

          {watch('recipient') !== 'all' && (
            <input
              type="hidden"
              {...register('memberId')}
              value={watch('recipient')}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              {...register('subject')}
              className="input-field"
              placeholder={notificationType ? getDefaultSubject(notificationType) : 'Enter subject'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              {...register('message', { required: 'Message is required' })}
              className="input-field"
              rows="4"
              placeholder="Enter your message here..."
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowSendModal(false)
                reset()
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Notifications