import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const buttonClasses = {
    danger: 'btn-danger',
    primary: 'btn-primary',
    secondary: 'btn-secondary'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start space-x-3 mb-6">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="btn btn-outline"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`btn ${buttonClasses[type]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog