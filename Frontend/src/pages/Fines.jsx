import React, { useState, useEffect } from 'react'
import { Plus, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { fineService, memberService, transactionService } from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

const Fines = () => {
  const [fines, setFines] = useState([])
  const [members, setMembers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [finesRes, membersRes, transactionsRes] = await Promise.all([
        fineService.getAll(),
        memberService.getAll(),
        transactionService.getAll()
      ])
      
      setFines(finesRes.data)
      setMembers(membersRes.data)
      setTransactions(transactionsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFine = async (data) => {
    try {
      const fineData = {
        memberId: parseInt(data.memberId),
        transactionId: data.transactionId ? parseInt(data.transactionId) : null,
        amount: parseFloat(data.amount),
        status: 'PENDING'
      }
      
      await fineService.create(fineData)
      toast.success('Fine added successfully!')
      setShowAddModal(false)
      reset()
      fetchData()
    } catch (error) {
      console.error('Error adding fine:', error)
    }
  }

  const handlePayFine = async (fineId) => {
    try {
      await fineService.pay(fineId)
      toast.success('Fine paid successfully!')
      fetchData()
    } catch (error) {
      console.error('Error paying fine:', error)
    }
  }

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.name : `Member ID: ${memberId}`
  }

  const getMemberEmail = (memberId) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.email : ''
  }

  const getTransactionInfo = (transactionId) => {
    if (!transactionId) return null
    const transaction = transactions.find(t => t.id === transactionId)
    return transaction
  }

  const filteredFines = fines.filter(fine => {
    switch (activeTab) {
      case 'pending':
        return fine.status === 'PENDING'
      case 'paid':
        return fine.status === 'PAID'
      default:
        return true
    }
  })

  const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0)
  const pendingFines = fines.filter(f => f.status === 'PENDING').reduce((sum, fine) => sum + fine.amount, 0)
  const paidFines = fines.filter(f => f.status === 'PAID').reduce((sum, fine) => sum + fine.amount, 0)

  const columns = [
    {
      key: 'member',
      header: 'Member',
      accessor: 'memberId',
      render: (fine) => (
        <div>
          <div className="font-medium text-gray-900">{getMemberName(fine.memberId)}</div>
          <div className="text-sm text-gray-500">{getMemberEmail(fine.memberId)}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: 'amount',
      render: (fine) => (
        <div className="font-medium text-gray-900">
          ${fine.amount.toFixed(2)}
        </div>
      )
    },
    {
      key: 'transaction',
      header: 'Related Transaction',
      sortable: false,
      render: (fine) => {
        const transaction = getTransactionInfo(fine.transactionId)
        return transaction ? (
          <div className="text-sm">
            <div>Transaction #{transaction.id}</div>
            <div className="text-gray-500">Book ID: {transaction.bookId}</div>
          </div>
        ) : (
          <span className="text-gray-500">Manual Fine</span>
        )
      }
    },
    {
      key: 'issuedDate',
      header: 'Issued Date',
      accessor: 'issuedDate',
      render: (fine) => format(parseISO(fine.issuedDate), 'MMM d, yyyy')
    },
    {
      key: 'paidDate',
      header: 'Paid Date',
      accessor: 'paidDate',
      render: (fine) => 
        fine.paidDate ? format(parseISO(fine.paidDate), 'MMM d, yyyy') : '-'
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (fine) => (
        <span className={`badge ${
          fine.status === 'PAID' ? 'badge-success' : 'badge-warning'
        }`}>
          {fine.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (fine) => (
        <div>
          {fine.status === 'PENDING' && (
            <button
              onClick={() => handlePayFine(fine.id)}
              className="btn btn-secondary text-xs px-3 py-1"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark Paid
            </button>
          )}
        </div>
      )
    }
  ]

  const tabs = [
    { key: 'all', label: 'All Fines', count: fines.length },
    { key: 'pending', label: 'Pending', count: fines.filter(f => f.status === 'PENDING').length },
    { key: 'paid', label: 'Paid', count: fines.filter(f => f.status === 'PAID').length }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fines</h1>
          <p className="text-gray-600">Manage library fines and payments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Fine
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Fines</p>
              <p className="text-2xl font-bold text-gray-900">${totalFines.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Fines</p>
              <p className="text-2xl font-bold text-gray-900">${pendingFines.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Fines</p>
              <p className="text-2xl font-bold text-gray-900">${paidFines.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Count</p>
              <p className="text-2xl font-bold text-gray-900">
                {fines.filter(f => f.status === 'PENDING').length}
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

        {/* Fines Table */}
        <div className="mt-6">
          <DataTable
            data={filteredFines}
            columns={columns}
            loading={loading}
            emptyMessage="No fines found"
          />
        </div>
      </div>

      {/* Add Fine Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          reset()
        }}
        title="Add Fine"
        size="md"
      >
        <form onSubmit={handleSubmit(handleAddFine)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Member *
            </label>
            <select
              {...register('memberId', { required: 'Member is required' })}
              className="input-field"
            >
              <option value="">Choose a member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
            {errors.memberId && (
              <p className="text-red-500 text-xs mt-1">{errors.memberId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Transaction (Optional)
            </label>
            <select
              {...register('transactionId')}
              className="input-field"
            >
              <option value="">No related transaction</option>
              {transactions.filter(t => t.status === 'BORROWED').map(transaction => (
                <option key={transaction.id} value={transaction.id}>
                  Transaction #{transaction.id} - Book ID: {transaction.bookId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fine Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                className="input-field pl-8"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false)
                reset()
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Fine
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Fines