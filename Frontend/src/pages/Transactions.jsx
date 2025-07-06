import React, { useState, useEffect } from 'react'
import { Plus, ArrowLeft, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { transactionService, bookService, memberService } from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format, isAfter, parseISO } from 'date-fns'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [transactionsRes, booksRes, membersRes] = await Promise.all([
        transactionService.getAll(),
        bookService.getAll(),
        memberService.getAll()
      ])
      
      setTransactions(transactionsRes.data)
      setBooks(booksRes.data)
      setMembers(membersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBorrowBook = async (data) => {
    try {
      const borrowData = {
        memberId: parseInt(data.memberId),
        bookId: parseInt(data.bookId),
        borrowDate: data.borrowDate,
        dueDate: data.dueDate
      }
      
      await transactionService.borrow(borrowData)
      toast.success('Book borrowed successfully!')
      setShowBorrowModal(false)
      reset()
      fetchData()
    } catch (error) {
      console.error('Error borrowing book:', error)
    }
  }

  const handleReturnBook = async (transactionId) => {
    try {
      await transactionService.return(transactionId)
      toast.success('Book returned successfully!')
      fetchData()
    } catch (error) {
      console.error('Error returning book:', error)
    }
  }

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId)
    return book ? book.title : `Book ID: ${bookId}`
  }

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.name : `Member ID: ${memberId}`
  }

  const getStatusBadge = (transaction) => {
    if (transaction.status === 'RETURNED') {
      return <span className="badge badge-success">Returned</span>
    }
    
    const isOverdue = isAfter(new Date(), parseISO(transaction.dueDate))
    if (isOverdue) {
      return <span className="badge badge-danger">Overdue</span>
    }
    
    return <span className="badge badge-warning">Borrowed</span>
  }

  const filteredTransactions = transactions.filter(transaction => {
    switch (activeTab) {
      case 'borrowed':
        return transaction.status === 'BORROWED'
      case 'returned':
        return transaction.status === 'RETURNED'
      case 'overdue':
        return transaction.status === 'BORROWED' && isAfter(new Date(), parseISO(transaction.dueDate))
      default:
        return true
    }
  })

  const columns = [
    {
      key: 'book',
      header: 'Book',
      accessor: 'bookId',
      render: (transaction) => (
        <div>
          <div className="font-medium text-gray-900">{getBookTitle(transaction.bookId)}</div>
          <div className="text-sm text-gray-500">ID: {transaction.bookId}</div>
        </div>
      )
    },
    {
      key: 'member',
      header: 'Member',
      accessor: 'memberId',
      render: (transaction) => (
        <div>
          <div className="font-medium text-gray-900">{getMemberName(transaction.memberId)}</div>
          <div className="text-sm text-gray-500">ID: {transaction.memberId}</div>
        </div>
      )
    },
    {
      key: 'borrowDate',
      header: 'Borrow Date',
      accessor: 'borrowDate',
      render: (transaction) => format(parseISO(transaction.borrowDate), 'MMM d, yyyy')
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      accessor: 'dueDate',
      render: (transaction) => {
        const dueDate = parseISO(transaction.dueDate)
        const isOverdue = transaction.status === 'BORROWED' && isAfter(new Date(), dueDate)
        return (
          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {format(dueDate, 'MMM d, yyyy')}
          </div>
        )
      }
    },
    {
      key: 'returnDate',
      header: 'Return Date',
      accessor: 'returnDate',
      render: (transaction) => 
        transaction.returnDate ? format(parseISO(transaction.returnDate), 'MMM d, yyyy') : '-'
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (transaction) => getStatusBadge(transaction)
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (transaction) => (
        <div>
          {transaction.status === 'BORROWED' && (
            <button
              onClick={() => handleReturnBook(transaction.id)}
              className="btn btn-secondary text-xs px-3 py-1"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Return
            </button>
          )}
        </div>
      )
    }
  ]

  const tabs = [
    { key: 'all', label: 'All Transactions', count: transactions.length },
    { key: 'borrowed', label: 'Borrowed', count: transactions.filter(t => t.status === 'BORROWED').length },
    { key: 'returned', label: 'Returned', count: transactions.filter(t => t.status === 'RETURNED').length },
    { key: 'overdue', label: 'Overdue', count: transactions.filter(t => t.status === 'BORROWED' && isAfter(new Date(), parseISO(t.dueDate))).length }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage book borrowing and returns</p>
        </div>
        <button
          onClick={() => setShowBorrowModal(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Borrow Book
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowLeft className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Currently Borrowed</p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.filter(t => t.status === 'BORROWED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Returned</p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.filter(t => t.status === 'RETURNED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.filter(t => t.status === 'BORROWED' && isAfter(new Date(), parseISO(t.dueDate))).length}
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

        {/* Transactions Table */}
        <div className="mt-6">
          <DataTable
            data={filteredTransactions}
            columns={columns}
            loading={loading}
            searchable={false}
            emptyMessage="No transactions found"
          />
        </div>
      </div>

      {/* Borrow Book Modal */}
      <Modal
        isOpen={showBorrowModal}
        onClose={() => {
          setShowBorrowModal(false)
          reset()
        }}
        title="Borrow Book"
        size="md"
      >
        <form onSubmit={handleSubmit(handleBorrowBook)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Member *
            </label>
            <select
              {...register('memberId', { required: 'Member is required' })}
              className="input-field"
            >
              <option value="">Choose a member</option>
              {members.filter(m => m.membershipStatus === 'ACTIVE').map(member => (
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
              Select Book *
            </label>
            <select
              {...register('bookId', { required: 'Book is required' })}
              className="input-field"
            >
              <option value="">Choose a book</option>
              {books.filter(b => b.availableCopies > 0).map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author} (Available: {book.availableCopies})
                </option>
              ))}
            </select>
            {errors.bookId && (
              <p className="text-red-500 text-xs mt-1">{errors.bookId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Borrow Date *
              </label>
              <input
                type="date"
                {...register('borrowDate', { required: 'Borrow date is required' })}
                defaultValue={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
              {errors.borrowDate && (
                <p className="text-red-500 text-xs mt-1">{errors.borrowDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                {...register('dueDate', { required: 'Due date is required' })}
                defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="input-field"
              />
              {errors.dueDate && (
                <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowBorrowModal(false)
                reset()
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Borrow Book
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Transactions