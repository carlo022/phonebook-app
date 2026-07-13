import { useState, useEffect } from 'react';
import api from '../services/api';

export default function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/contacts');
      setContacts(response.data);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const addContact = async (contactData) => {
    await api.post('/contacts', contactData);
    fetchContacts(); // Refresh list
  };

  const updateContact = async (id, contactData) => {
    await api.put(`/contacts/${id}`, contactData);
    fetchContacts();
  };

  const deleteContact = async (id) => {
    await api.delete(`/contacts/${id}`);
    fetchContacts();
  };

   // Fetch users for the search bar
  const fetchActiveUsers = async () => {
    try {
      const response = await api.get('/users/active');
      setActiveUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch active users', err);
    }
  };

  const shareContact = async (id, targetEmail) => {
    await api.put(`/contacts/${id}/share`, { targetEmail, action: 'share' });
    fetchContacts(); // Automatically syncs the UI
  };

  const unshareContact = async (id, targetEmail) => {
    await api.put(`/contacts/${id}/share`, { targetEmail, action: 'unshare' });
    fetchContacts(); // Automatically syncs the UI
  };

  return {
    contacts,
    activeUsers,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    shareContact,
    unshareContact,
    fetchContacts,
    fetchActiveUsers,
  };
}