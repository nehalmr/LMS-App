import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Users, 
  ArrowRightLeft, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { dashboardService, transactionService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { format } from 'date-fns'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, transactionsData] = await Promise.all([
        dashboardService.getStats(),
        transactionService.getAll()
      ])
      
      setStats(statsData)
      setRecentTransactions(transactionsData.data.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Books',
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Members',
      value: stats?.totalMembers || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Active Loans',
      value: stats?.activeTransactions || 0,
      icon: ArrowRightLeft,
      color: 'from-purple-500 to-purple-600',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Overdue Books',
      value: stats?.overdueTransactions || 0,
      icon: Clock,
      color: 'from-red-500 to-red-600',
      change: '-3%',
      changeType: 'negative'
    },
    {
      title: 'Total Fines',
      value: `$${stats?.totalFines?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Pending Fines',
      value: stats?.pendingFines || 0,
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      change: '-5%',
      changeType: 'negative'
    }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your library.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card bg-gradient-to-br ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-3 w-3 mr-1 ${
                    stat.changeType === 'positive' ? 'text-green-200' : 'text-red-200'
                  }`} />
                  <span className={`text-xs ${
                    stat.changeType === 'positive' ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {stat.change} from last month
                  </span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Book ID: {transaction.bookId}</p>
                      <p className="text-xs text-gray-500">Member ID: {transaction.memberId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      transaction.status === 'BORROWED' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {transaction.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(transaction.borrowDate), 'MMM d')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <BookOpen className="h-8 w-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-primary-700">Add Book</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-700">Add Member</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <ArrowRightLeft className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-700">New Transaction</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-700">View Overdue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section (Placeholder for future implementation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Transactions</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart coming soon...</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Books</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard