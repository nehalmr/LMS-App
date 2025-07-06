import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { bookService } from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const Books = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGenre, setFilterGenre] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await bookService.getAll()
      setBooks(response.data)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBook = async (data) => {
    try {
      await bookService.create(data)
      toast.success('Book added successfully!')
      setShowAddModal(false)
      reset()
      fetchBooks()
    } catch (error) {
      console.error('Error adding book:', error)
    }
  }

  const handleEditBook = async (data) => {
    try {
      await bookService.update(selectedBook.id, data)
      toast.success('Book updated successfully!')
      setShowEditModal(false)
      setSelectedBook(null)
      reset()
      fetchBooks()
    } catch (error) {
      console.error('Error updating book:', error)
    }
  }

  const handleDeleteBook = async () => {
    try {
      await bookService.delete(selectedBook.id)
      toast.success('Book deleted successfully!')
      setSelectedBook(null)
      fetchBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
    }
  }

  const openEditModal = (book) => {
    setSelectedBook(book)
    setValue('title', book.title)
    setValue('author', book.author)
    setValue('genre', book.genre)
    setValue('isbn', book.isbn)
    setValue('yearPublished', book.yearPublished)
    setValue('totalCopies', book.totalCopies)
    setValue('availableCopies', book.availableCopies)
    setShowEditModal(true)
  }

  const openDeleteDialog = (book) => {
    setSelectedBook(book)
    setShowDeleteDialog(true)
  }

  // Filter books based on search and genre
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = !filterGenre || book.genre === filterGenre
    return matchesSearch && matchesGenre
  })

  // Get unique genres for filter
  const genres = [...new Set(books.map(book => book.genre))].filter(Boolean)

  const columns = [
    {
      key: 'title',
      header: 'Title',
      accessor: 'title',
      render: (book) => (
        <div>
          <div className="font-medium text-gray-900">{book.title}</div>
          <div className="text-sm text-gray-500">ISBN: {book.isbn}</div>
        </div>
      )
    },
    {
      key: 'author',
      header: 'Author',
      accessor: 'author'
    },
    {
      key: 'genre',
      header: 'Genre',
      accessor: 'genre',
      render: (book) => (
        <span className="badge badge-info">{book.genre}</span>
      )
    },
    {
      key: 'year',
      header: 'Year',
      accessor: 'yearPublished'
    },
    {
      key: 'copies',
      header: 'Copies',
      accessor: 'totalCopies',
      render: (book) => (
        <div className="text-center">
          <div className="text-sm font-medium">{book.availableCopies}/{book.totalCopies}</div>
          <div className="text-xs text-gray-500">Available/Total</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (book) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(book)}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(book)}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const BookForm = ({ onSubmit, defaultValues = {} }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="input-field"
            placeholder="Enter book title"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author *
          </label>
          <input
            {...register('author', { required: 'Author is required' })}
            className="input-field"
            placeholder="Enter author name"
          />
          {errors.author && (
            <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Genre
          </label>
          <input
            {...register('genre')}
            className="input-field"
            placeholder="Enter genre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ISBN
          </label>
          <input
            {...register('isbn')}
            className="input-field"
            placeholder="Enter ISBN"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year Published
          </label>
          <input
            type="number"
            {...register('yearPublished', { 
              min: { value: 1000, message: 'Invalid year' },
              max: { value: new Date().getFullYear(), message: 'Year cannot be in the future' }
            })}
            className="input-field"
            placeholder="Enter year"
          />
          {errors.yearPublished && (
            <p className="text-red-500 text-xs mt-1">{errors.yearPublished.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Copies *
          </label>
          <input
            type="number"
            {...register('totalCopies', { 
              required: 'Total copies is required',
              min: { value: 1, message: 'Must be at least 1' }
            })}
            className="input-field"
            placeholder="Enter total copies"
          />
          {errors.totalCopies && (
            <p className="text-red-500 text-xs mt-1">{errors.totalCopies.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available Copies *
          </label>
          <input
            type="number"
            {...register('availableCopies', { 
              required: 'Available copies is required',
              min: { value: 0, message: 'Cannot be negative' }
            })}
            className="input-field"
            placeholder="Enter available copies"
          />
          {errors.availableCopies && (
            <p className="text-red-500 text-xs mt-1">{errors.availableCopies.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false)
            setShowEditModal(false)
            reset()
          }}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {selectedBook ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-600">Manage your library's book collection</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="input-field"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="card">
        <DataTable
          data={filteredBooks}
          columns={columns}
          loading={loading}
          searchable={false} // We have custom search
          emptyMessage="No books found"
        />
      </div>

      {/* Add Book Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          reset()
        }}
        title="Add New Book"
        size="lg"
      >
        <BookForm onSubmit={handleAddBook} />
      </Modal>

      {/* Edit Book Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedBook(null)
          reset()
        }}
        title="Edit Book"
        size="lg"
      >
        <BookForm onSubmit={handleEditBook} />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedBook(null)
        }}
        onConfirm={handleDeleteBook}
        title="Delete Book"
        message={`Are you sure you want to delete "${selectedBook?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default Books