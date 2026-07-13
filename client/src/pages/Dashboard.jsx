import { useState, useContext, useEffect } from 'react';
import { Phone, Mail, Edit, Trash2, Share2, Plus, ImageIcon, Search, X, MoreVertical } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import useContacts from '../hooks/useContacts';
import Loader from '../components/Loader';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  
  const { 
    contacts, 
    activeUsers, 
    isLoading, 
    addContact, 
    updateContact, 
    deleteContact, 
    shareContact,
    unshareContact,
    fetchActiveUsers
  } = useContacts();

  // Contact Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', contactNumber: '', emailAddress: '', profilePhoto: '',
  });

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareContactId, setShareContactId] = useState(null);
  const [shareSearchQuery, setShareSearchQuery] = useState('');

  // Main Dashboard Header State
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // NEW: Controls mobile header menu

  // Fetch active users when the component loads
  useEffect(() => {
    fetchActiveUsers();
  }, []);

  // --- STANDARD CONTACT CRUD LOGIC ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, profilePhoto: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAddNew = () => {
    setFormData({ firstName: '', lastName: '', contactNumber: '', emailAddress: '', profilePhoto: '' });
    setEditingId(null);
    setIsModalOpen(true);
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  const handleEdit = (contact) => {
    setFormData({ ...contact });
    setEditingId(contact._id); 
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await updateContact(editingId, formData);
      else await addContact(formData);
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save contact');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id);
    }
  };

  // --- SHARING LOGIC ---
  const openShareModal = (contactId) => {
    setShareContactId(contactId);
    setShareSearchQuery('');
    setIsShareModalOpen(true);
  };

  const handleToggleShare = async (targetEmail, isCurrentlyShared) => {
    try {
      if (isCurrentlyShared) {
        await unshareContact(shareContactId, targetEmail);
      } else {
        await shareContact(shareContactId, targetEmail);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update sharing permissions');
    }
  };

  // --- FILTERING LOGIC ---
  const currentShareContact = contacts.find(c => c._id === shareContactId);
  const filteredUsers = activeUsers.filter(u => 
    u.id !== user.id && 
    (u.email.toLowerCase().includes(shareSearchQuery.toLowerCase()) || 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(shareSearchQuery.toLowerCase()))
  );

  const filteredContacts = contacts.filter(contact => {
    const searchLower = contactSearchQuery.toLowerCase();
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const email = contact.emailAddress ? contact.emailAddress.toLowerCase() : '';
    
    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      contact.contactNumber.includes(searchLower)
    );
  });

     if (isLoading && contacts.length === 0) {
       return (
        <div className="mt-8 pb-12">
         <Loader message="Loading your phonebook..." />
       </div>
          );
     }

  return (
    <div className="mt-8 pb-12">
      
      {/* --- RESPONSIVE HEADER --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Top Row: Title and Mobile Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <h1 className="text-3xl font-bold text-gray-800">My Phonebook</h1>
          
          {/* Mobile Toggle Button (Hidden on md screens and up) */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-200 rounded-md transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <MoreVertical size={24} />}
          </button>
        </div>

        {/* Search & Actions Area (Hidden on mobile unless toggled, always visible on md+) */}
        <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto gap-4 items-center flex-1 md:justify-end`}>
          
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or number..." 
              value={contactSearchQuery}
              onChange={(e) => setContactSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Add Contact Button */}
          <button 
            onClick={handleAddNew} 
            className="w-full md:w-auto flex items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-blue-700 transition whitespace-nowrap"
          >
            <Plus size={20} /> Add Contact
          </button>
        </div>
      </div>

      {/* --- CONTACTS GRID --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredContacts.map((contact) => {
          const isOwner = contact.ownerId === user.id;

          return (
            <div key={contact._id} className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-lg">
              <div className="h-24 bg-blue-500 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gray-200">
                  {contact.profilePhoto ? (
                    <img src={contact.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl font-bold text-gray-400">{contact.firstName.charAt(0)}</div>
                  )}
                </div>
              </div>
              
              <div className="pt-12 pb-6 px-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">{contact.firstName} {contact.lastName}</h3>
                {!isOwner && <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">Shared with you</span>}

                <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 text-left">
                  <div className="flex items-center gap-3"><Phone size={16} className="text-blue-500" /> {contact.contactNumber}</div>
                  <div className="flex items-center gap-3 truncate"><Mail size={16} className="text-blue-500" /> {contact.emailAddress || 'N/A'}</div>
                </div>

                {isOwner && (
                  <div className="mt-6 flex justify-center gap-3 border-t pt-4">
                    <button onClick={() => handleEdit(contact)} className="rounded p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition" title="Edit"><Edit size={18} /></button>
                    <button onClick={() => openShareModal(contact._id)} className="rounded p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 transition" title="Share Settings"><Share2 size={18} /></button>
                    <button onClick={() => handleDelete(contact._id)} className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition" title="Delete"><Trash2 size={18} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty States */}
        {contacts.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Your phonebook is empty. Click "Add Contact" to get started.
          </div>
        )}
        {contacts.length > 0 && filteredContacts.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No contacts found matching "{contactSearchQuery}".
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">{editingId ? 'Edit Contact' : 'New Contact'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 w-full rounded-md border p-2 outline-none focus:border-blue-500" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 w-full rounded-md border p-2 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="mt-1 w-full rounded-md border p-2 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} className="mt-1 w-full rounded-md border p-2 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                <div className="mt-1 flex items-center gap-4">
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} alt="Preview" className="h-12 w-12 rounded-full object-cover shadow" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400"><ImageIcon size={20} /></div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition">{editingId ? 'Save Changes' : 'Create Contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SHARE SETTINGS MODAL --- */}
      {isShareModalOpen && currentShareContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Share Settings</h2>
              <button onClick={() => setIsShareModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
            </div>
            
            <p className="mb-4 text-sm text-gray-600">
              Sharing <span className="font-semibold text-gray-900">{currentShareContact.firstName} {currentShareContact.lastName}</span>'s contact card.
            </p>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={shareSearchQuery}
                onChange={(e) => setShareSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto rounded-md border bg-gray-50 p-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => {
                  const isShared = currentShareContact.sharedWith.includes(u.id);

                  return (
                    <div key={u.id} className="mb-2 flex items-center justify-between rounded-md bg-white p-3 shadow-sm border border-gray-100 last:mb-0">
                      <div>
                        <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <button 
                        onClick={() => handleToggleShare(u.email, isShared)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                          isShared 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {isShared ? 'Unshare' : 'Share'}
                      </button>
                    </div>
                  )
                })
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">No users found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}