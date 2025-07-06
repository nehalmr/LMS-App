import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import { memberService } from '../services/api'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const Members = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await memberService.getAll()
      setMembers(response.data)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (data) => {
    try {
      await memberService.create(data)
      toast.success('Member added successfully!')
      setShowAddModal(false)
      reset()
      fetchMembers()
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }

  const handleEditMember = async (data) => {
    try {
      await memberService.update(selectedMember.id, data)
      toast.success('Member updated successfully!')
      setShowEditModal(false)
      setSelectedMember(null)
      reset()
      fetchMembers()
    } catch (error) {
      console.error('Error updating member:', error)
    }
  }

  const handleDeleteMember = async () => {
    try {
      await memberService.delete(selectedMember.id)
      toast.success('Member deleted successfully!')
      setSelectedMember(null)
      fetchMembers()
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  const handleStatusChange = async (member, newStatus) => {
    try {
      await memberService.updateStatus(member.id, newStatus)
      toast.success(`Member status updated to ${newStatus}`)
      fetchMembers()
    } catch (error) {
      console.error('Error updating member status:', error)
    }
  }

  const openEditModal = (member) => {
    setSelectedMember(member)
    setValue('name', member.name)
    setValue('email', member.email)
    setValue('phone', member.phone)
    setValue('address', member.address)
    setValue('membershipStatus', member.membershipStatus)
    setShowEditModal(true)
  }

  const openDeleteDialog = (member) => {
    setSelectedMember(member)
    setShowDeleteDialog(true)
  }

  const columns = [
    {
      key: 'member',
      header: 'Member',
      accessor: 'name',
      render: (member) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {member.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{member.name}</div>
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="h-3 w-3 mr-1" />
              {member.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      sortable: false,
      render: (member) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <Phone className="h-3 w-3 mr-1 text-gray-400" />
            {member.phone || 'N/A'}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
            {member.address || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'membershipStatus',
      render: (member) => (
        <select
          value={member.membershipStatus}
          onChange={(e) => handleStatusChange(member, e.target.value)}
          className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${
            member.membershipStatus === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (member) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(member)}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(member)}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const MemberForm = ({ onSubmit }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="input-field"
            placeholder="Enter full name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="input-field"
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="input-field"
            placeholder="Enter phone number"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            {...register('address')}
            className="input-field"
            rows="3"
            placeholder="Enter address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Membership Status
          </label>
          <select
            {...register('membershipStatus')}
            className="input-field"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
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
          {selectedMember ? 'Update Member' : 'Add Member'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage library members and their information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.membershipStatus === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.membershipStatus === 'INACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suspended Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.membershipStatus === 'SUSPENDED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card">
        <DataTable
          data={members}
          columns={columns}
          loading={loading}
          emptyMessage="No members found"
        />
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          reset()
        }}
        title="Add New Member"
        size="lg"
      >
        <MemberForm onSubmit={handleAddMember} />
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedMember(null)
          reset()
        }}
        title="Edit Member"
        size="lg"
      >
        <MemberForm onSubmit={handleEditMember} />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedMember(null)
        }}
        onConfirm={handleDeleteMember}
        title="Delete Member"
        message={`Are you sure you want to delete "${selectedMember?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default Members