import React, { useState, useEffect } from 'react'
import { Download, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react'
import { dashboardService, bookService, memberService, transactionService, fineService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { format, subDays, subMonths } from 'date-fns'

const Reports = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const [books, members, transactions, fines, stats] = await Promise.all([
        bookService.getAll(),
        memberService.getAll(),
        transactionService.getAll(),
        fineService.getAll(),
        dashboardService.getStats()
      ])

      // Process data for reports
      const processedData = {
        books: books.data,
        members: members.data,
        transactions: transactions.data,
        fines: fines.data,
        stats,
        summary: {
          totalBooks: books.data.length,
          totalMembers: members.data.length,
          totalTransactions: transactions.data.length,
          totalFines: fines.data.reduce((sum, fine) => sum + fine.amount, 0),
          activeLoans: transactions.data.filter(t => t.status === 'BORROWED').length,
          overdueBooks: transactions.data.filter(t => 
            t.status === 'BORROWED' && new Date(t.dueDate) < new Date()
          ).length
        }
      }

      setReportData(processedData)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = (type) => {
    // This would typically generate and download a PDF or Excel file
    console.log(`Generating ${type} report...`)
    // For demo purposes, we'll just show a toast
    import('react-hot-toast').then(({ default: toast }) => {
      toast.success(`${type} report generated successfully!`)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  const reportCards = [
    {
      title: 'Books Report',
      description: 'Complete inventory and circulation statistics',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      stats: [
        { label: 'Total Books', value: reportData?.summary.totalBooks || 0 },
        { label: 'Available', value: reportData?.books?.reduce((sum, book) => sum + book.availableCopies, 0) || 0 },
        { label: 'Borrowed', value: reportData?.summary.activeLoans || 0 }
      ]
    },
    {
      title: 'Members Report',
      description: 'Member registration and activity analysis',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      stats: [
        { label: 'Total Members', value: reportData?.summary.totalMembers || 0 },
        { label: 'Active', value: reportData?.members?.filter(m => m.membershipStatus === 'ACTIVE').length || 0 },
        { label: 'Inactive', value: reportData?.members?.filter(m => m.membershipStatus === 'INACTIVE').length || 0 }
      ]
    },
    {
      title: 'Transactions Report',
      description: 'Borrowing patterns and circulation trends',
      icon: PieChart,
      color: 'from-purple-500 to-purple-600',
      stats: [
        { label: 'Total Transactions', value: reportData?.summary.totalTransactions || 0 },
        { label: 'Active Loans', value: reportData?.summary.activeLoans || 0 },
        { label: 'Overdue', value: reportData?.summary.overdueBooks || 0 }
      ]
    },
    {
      title: 'Financial Report',
      description: 'Fines collection and revenue analysis',
      icon: TrendingUp,
      color: 'from-yellow-500 to-yellow-600',
      stats: [
        { label: 'Total Fines', value: `$${reportData?.summary.totalFines?.toFixed(2) || '0.00'}` },
        { label: 'Pending', value: reportData?.fines?.filter(f => f.status === 'PENDING').length || 0 },
        { label: 'Paid', value: reportData?.fines?.filter(f => f.status === 'PAID').length || 0 }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports and view analytics</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
            <option value="1year">Last year</option>
          </select>
          <button className="btn btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{reportData?.summary.totalBooks}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData?.members?.filter(m => m.membershipStatus === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{reportData?.summary.activeLoans}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${reportData?.summary.totalFines?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCards.map((report, index) => (
          <div key={index} className={`stat-card bg-gradient-to-br ${report.color}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{report.title}</h3>
                <p className="text-white/80 text-sm">{report.description}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <report.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              {report.stats.map((stat, statIndex) => (
                <div key={statIndex} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/80 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => generateReport(report.title)}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2 inline" />
              Generate Report
            </button>
          </div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Borrowed Books</h3>
          <div className="space-y-3">
            {reportData?.books?.slice(0, 5).map((book, index) => (
              <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{book.title}</div>
                  <div className="text-sm text-gray-500">by {book.author}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{book.totalCopies - book.availableCopies}</div>
                  <div className="text-xs text-gray-500">times borrowed</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Members */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Members</h3>
          <div className="space-y-3">
            {reportData?.members?.filter(m => m.membershipStatus === 'ACTIVE').slice(0, 5).map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {reportData?.transactions?.filter(t => t.memberId === member.id).length}
                  </div>
                  <div className="text-xs text-gray-500">transactions</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Transactions</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Genre Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports