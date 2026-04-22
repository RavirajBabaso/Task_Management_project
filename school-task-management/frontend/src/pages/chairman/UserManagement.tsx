import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import UserTable from '../../components/tables/UserTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import type { User } from '../../types/user.types';
import { ROLES, ROLE_LABELS, DEPARTMENT_HEAD_ROLES } from '../../constants/roles';

interface AddUserForm {
  name: string;
  email: string;
  role: string;
  department_id: number | null;
  password: string;
}

interface EditUserForm {
  name: string;
  email: string;
  department_id: number | null;
  password?: string;
}

interface Department {
  id: number;
  name: string;
}

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addForm, setAddForm] = useState<AddUserForm>({
    name: '',
    email: '',
    role: '',
    department_id: null,
    password: '',
  });
  const [editForm, setEditForm] = useState<EditUserForm>({
    name: '',
    email: '',
    department_id: null,
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data as User[];
    },
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await axios.get('/api/departments');
      return response.data as Department[];
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: AddUserForm) => {
      const response = await axios.post('/api/users', userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddModalOpen(false);
      setAddForm({ name: '', email: '', role: '', department_id: null, password: '' });
      setAddErrors({});
      alert('User added successfully');
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setAddErrors(error.response.data.errors);
      } else {
        alert('Failed to add user');
      }
    },
  });

  const editUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: EditUserForm }) => {
      const response = await axios.put(`/api/users/${id}`, userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setEditErrors({});
      alert('User updated successfully');
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setEditErrors(error.response.data.errors);
      } else {
        alert('Failed to update user');
      }
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeactivateModalOpen(false);
      setSelectedUser(null);
      alert('User deactivated successfully');
    },
    onError: () => {
      alert('Failed to deactivate user');
    },
  });

  const handleAddUser = () => {
    addUserMutation.mutate(addForm);
  };

  const handleEditUser = () => {
    if (selectedUser) {
      editUserMutation.mutate({ id: selectedUser.id, userData: editForm });
    }
  };

  const handleDeactivateUser = () => {
    if (selectedUser) {
      deactivateUserMutation.mutate(selectedUser.id);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      department_id: user.department_id,
    });
    setIsEditModalOpen(true);
  };

  const openDeactivateModal = (user: User) => {
    setSelectedUser(user);
    setIsDeactivateModalOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add new user</Button>
      </div>

      <UserTable
        users={users || []}
        onEdit={openEditModal}
        onDeactivate={openDeactivateModal}
      />

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} loading={addUserMutation.isPending}>Add User</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {addErrors.name && <p className="mt-1 text-sm text-red-600">{addErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {addErrors.email && <p className="mt-1 text-sm text-red-600">{addErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Role</option>
              {DEPARTMENT_HEAD_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            {addErrors.role && <p className="mt-1 text-sm text-red-600">{addErrors.role}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              value={addForm.department_id || ''}
              onChange={(e) => setAddForm({ ...addForm, department_id: parseInt(e.target.value) || null })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {addErrors.department_id && <p className="mt-1 text-sm text-red-600">{addErrors.department_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
            <input
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {addErrors.password && <p className="mt-1 text-sm text-red-600">{addErrors.password}</p>}
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser} loading={editUserMutation.isPending}>Update User</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {editErrors.name && <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {editErrors.email && <p className="mt-1 text-sm text-red-600">{editErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              value={editForm.department_id || ''}
              onChange={(e) => setEditForm({ ...editForm, department_id: parseInt(e.target.value) || null })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {editErrors.department_id && <p className="mt-1 text-sm text-red-600">{editErrors.department_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password (optional)</label>
            <input
              type="password"
              value={editForm.password || ''}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title="Deactivate User"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsDeactivateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleDeactivateUser} variant="danger" loading={deactivateUserMutation.isPending}>
              Deactivate
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to deactivate {selectedUser?.name}? They will lose access immediately.
        </p>
      </Modal>
    </div>
  );
};

export default UserManagement;