import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Sun, Moon, Calendar, Users, DollarSign, TrendingUp, ArrowRight, Clock, Activity, 
  Search, ShieldAlert, Award, FileText, Settings, Heart, Star, Ticket, Trash2, Edit, CheckSquare, XCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import EventModal from '../components/EventModal';

const Dashboard = () => {
    const { user, loading: authLoading, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Live Database State Management
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    
    const [loading, setLoading] = useState(true);
    
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    // Browse & Search Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    // User Favorites & Reviews States
    const [favorites, setFavorites] = useState([]);
    const [reviewEventId, setReviewEventId] = useState('');
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    
    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', email: '' });

    // Admin Custom Settings & Logs States
    const [auditLogs, setAuditLogs] = useState([]);
    const [logsSearchTerm, setLogsSearchTerm] = useState('');
    const [logsFilterAction, setLogsFilterAction] = useState('All');
    const [systemSettings, setSystemSettings] = useState({
        commission: 10,
        autoApprove: true,
        maintenanceMode: false,
        allowRegistration: true
    });

    // Fetch all database records
    const fetchData = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch Events
            const eventRes = await axios.get('/api/events');
            setEvents(eventRes.data);
            
            // 2. Fetch Bookings (Based on role, backend will handle filters)
            const bookingUrl = user.role === 'User' ? '/api/bookings/mybookings' : '/api/bookings';
            const bookingRes = await axios.get(bookingUrl);
            setBookings(bookingRes.data);
            
            // 3. Fetch Users & Logs (Admin only)
            if (user.role === 'Admin') {
                const usersRes = await axios.get('/api/auth/users');
                setAllUsers(usersRes.data);
                try {
                    const logsRes = await axios.get('/api/auth/audit-logs');
                    setAuditLogs(logsRes.data);
                } catch (logsErr) {
                    console.error('Error fetching audit logs:', logsErr);
                }
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user && !authLoading) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchData();
            setProfileData({ name: user.name, email: user.email || `${user.name.toLowerCase().replace(/ /g, '')}@example.com` });
        }
    }, [user]);

    // Dark Mode Theme Init
    useEffect(() => {
        const isDark = localStorage.getItem('theme') === 'dark' || 
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDarkMode(isDark);
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- Organizer / Admin Event Actions ---
    const handleOpenCreateModal = () => {
        setEditingEvent(null);
        setIsEventModalOpen(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = async (eventData) => {
        try {
            if (eventData._id) {
                await axios.put(`/api/events/${eventData._id}`, eventData);
                alert('Event updated successfully');
            } else {
                await axios.post('/api/events', eventData);
                alert('Event created successfully');
            }
            fetchData();
            setEditingEvent(null);
            setIsEventModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await axios.delete(`/api/events/${id}`);
                alert('Event deleted successfully');
                fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting event');
            }
        }
    };

    // --- Admin Special Actions (Moderation & Users) ---
    const handleToggleBlock = async (userId) => {
        try {
            const res = await axios.put(`/api/auth/users/${userId}/block`);
            alert(res.data.message);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating block status');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await axios.put(`/api/auth/users/${userId}/role`, { role: newRole });
            alert('User role updated successfully');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating user role');
        }
    };

    const handleUpdateEventStatus = async (eventId, newStatus) => {
        try {
            await axios.put(`/api/events/${eventId}/status`, { status: newStatus });
            alert(`Event status updated to: ${newStatus}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating event approval status');
        }
    };

    // --- Organizer Checkin Action ---
    const handleToggleCheckIn = async (bookingId) => {
        try {
            await axios.put(`/api/bookings/${bookingId}/checkin`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating check-in status');
        }
    };

    // --- Attendee Actions ---
    const handleBookEvent = async (eventId) => {
        try {
            await axios.post('/api/bookings', { eventId });
            alert("Booking Confirmed! You can view and download your ticket QR Code under My Tickets.");
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to book event');
        }
    };

    const handleCancelRegistration = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking registration?")) {
            try {
                const res = await axios.delete(`/api/bookings/${bookingId}`);
                alert(res.data.message || "Booking registration cancelled successfully!");
                fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Error cancelling registration');
            }
        }
    };

    const handleDownloadTicket = (booking) => {
        alert(`--------- TICKET RECEIPT ---------\nBooking ID: BKG-${booking._id.toUpperCase()}\nEvent: ${booking.eventId?.title}\nAttendee Name: ${user.name}\nDate: ${new Date(booking.eventId?.date).toLocaleDateString()}\nStatus: Confirmed\n\nEnjoy the event!\n-----------------------------------`);
    };

    const handleAddFavorite = (eventId) => {
        if (favorites.includes(eventId)) {
            setFavorites(favorites.filter(id => id !== eventId));
            alert("Removed from favorites");
        } else {
            setFavorites([...favorites, eventId]);
            alert("Added to favorites!");
        }
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        alert(`Review submitted successfully! Rating: ${rating}/5. Description: "${reviewText}"`);
        setReviewText('');
        setReviewEventId('');
    };

    const handleExportAttendeesCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Attendee Name,Attendee Email,Event Registered,Check-in Status,Registration Date\n";
        bookings.forEach(b => {
            csvContent += `"${b.userId?.name || 'Rahul Sharma'}","${b.userId?.email || 'user@ems.com'}","${b.eventId?.title || 'N/A'}","${b.isCheckedIn ? 'Checked-In' : 'Pending'}","${new Date(b.createdAt).toLocaleDateString()}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `EMS_Attendees_Export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportReport = (e) => {
        e.preventDefault();
        const reportType = e.target.reportType.value;
        const range = e.target.range.value;

        // Calculate gross volume for reports
        const totalRevenueValue = bookings.reduce((sum, b) => sum + (b.eventId?.price || 0), 0);

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Report Title,EMS Platform System Audit Report\n";
        csvContent += `Generated Date,${new Date().toLocaleString()}\n`;
        csvContent += `Report Type,${reportType}\n`;
        csvContent += `Date Range,${range}\n\n`;

        if (reportType.includes("Financial")) {
            csvContent += "Metric,Value\n";
            csvContent += `Gross Platform Volume,$${totalRevenueValue.toFixed(2)}\n`;
            csvContent += `Platform Commission Profit (10%),$${(totalRevenueValue * 0.1).toFixed(2)}\n`;
            csvContent += `Net Settled Payouts,$${(totalRevenueValue * 0.9).toFixed(2)}\n`;
        } else if (reportType.includes("Event")) {
            csvContent += "Event Title,Organizer,Category,Registrations,Price,Gross Revenue\n";
            events.forEach(ev => {
                const count = bookings.filter(b => b.eventId?._id === ev._id).length;
                csvContent += `"${ev.title}","${ev.organizerId?.name || 'N/A'}","${ev.category}",${count},${ev.price},${count * ev.price}\n`;
            });
        } else {
            csvContent += "Action,Actor Name,Actor Email,Details,Timestamp\n";
            auditLogs.forEach(log => {
                csvContent += `"${log.action}","${log.performedBy?.name || 'System'}","${log.performedBy?.email || 'N/A'}","${log.details.replace(/"/g, '""')}","${new Date(log.createdAt).toLocaleString()}"\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `EMS_${reportType.replace(/ /g, "_")}_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (authLoading || (loading && !user)) {
        return <div className="p-8 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-900 h-screen flex justify-center items-center font-semibold text-lg">Loading EMS Dashboard System...</div>;
    }

    if (!user) {
        return null;
    }

    // Role Checks
    const isUser = user.role === 'User';
    const isOrganizer = user.role === 'Organizer';
    const isAdmin = user.role === 'Admin';

    // Sidebar Items based on role
    const getSidebarTabs = () => {
        if (isUser) return ['Dashboard', 'Browse Events', 'My Registrations', 'My Tickets', 'Favorites', 'Reviews & Ratings', 'Settings'];
        if (isOrganizer) return ['Dashboard', 'Create Event', 'Manage Events', 'Attendees', 'Ticket Sales', 'Revenue', 'Reports', 'Settings'];
        if (isAdmin) return ['Dashboard', 'Users', 'Organizers', 'Events', 'Categories', 'Payments', 'Reports', 'System Settings', 'Audit Logs'];
        return ['Dashboard'];
    };

    // Filter Events specifically created by this Organizer
    const organizerEvents = events.filter(e => e.organizerId === user.id || e.organizerId?._id === user.id);

    // Active events are events with date >= today
    const activeEventsList = events.filter(e => new Date(e.date) >= new Date() && e.status === 'Active');

    // -------------------------------------------------------------
    // RENDER 1: ATTENDEE (USER) DASHBOARD
    // -------------------------------------------------------------
    const renderUserDashboard = () => {
        const userBookings = bookings;
        const availableEvents = events.filter(e => e.status === 'Active' && !userBookings.some(b => b.eventId?._id === e._id));
        const savedEventsCount = favorites.length;

        // Filters for Browsing
        const browseFilteredEvents = events.filter(e => {
            const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
            return e.status === 'Active' && matchesSearch && matchesCategory;
        });

        switch (activeTab) {
            case 'Browse Events':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150 dark:border-gray-700">
                            <div className="relative w-full md:w-1/3">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search events by name or city..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                                />
                            </div>
                            <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
                                {['All', 'Tech', 'Business', 'Entertainment', 'General'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => setCategoryFilter(c)}
                                        className={`px-4 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-colors ${categoryFilter === c ? 'bg-primary text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {browseFilteredEvents.map(e => (
                                <div key={e._id} className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 hover:border-primary/50 transition-colors flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="bg-primary/10 text-primary dark:bg-primary/20 px-2.5 py-1 rounded-md text-xs font-bold">{e.category}</span>
                                            <button onClick={() => handleAddFavorite(e._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Heart size={20} className={favorites.includes(e._id) ? "fill-red-500 text-red-500" : ""} />
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-dark dark:text-white leading-tight">{e.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{e.description}</p>
                                        
                                        <div className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                            <p className="flex items-center"><Calendar size={14} className="mr-2 opacity-70" /> {new Date(e.date).toLocaleDateString()} at {e.time}</p>
                                            <p className="flex items-center"><Users size={14} className="mr-2 opacity-70" /> Organizer: {e.organizerId?.name || 'EMS Organizer'}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-6 flex justify-between items-center">
                                        <span className="text-lg font-bold text-dark dark:text-white">${e.price}</span>
                                        <button 
                                            onClick={() => handleBookEvent(e._id)} 
                                            className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark shadow-md"
                                        >
                                            Register Event
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'My Registrations':
                return (
                    <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">My Registrations</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-3">
                                        <th className="pb-3">Event Name</th>
                                        <th className="pb-3">Date</th>
                                        <th className="pb-3">Price Paid</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                    {userBookings.map(b => (
                                        <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="py-4 font-bold text-dark dark:text-white">{b.eventId?.title || 'Removed Event'}</td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">{b.eventId ? new Date(b.eventId.date).toLocaleDateString() : 'N/A'}</td>
                                            <td className="py-4 font-bold text-dark dark:text-white">${b.eventId?.price || 0}</td>
                                            <td className="py-4">
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">Confirmed</span>
                                            </td>
                                            <td className="py-4 text-right space-x-2">
                                                <button onClick={() => handleDownloadTicket(b)} className="text-xs text-primary font-bold hover:underline">Download Ticket</button>
                                                <button onClick={() => handleCancelRegistration(b._id)} className="text-xs text-red-500 font-bold hover:underline">Cancel Registration</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {userBookings.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-gray-500">You haven't registered for any events yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'My Tickets':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userBookings.map(b => (
                            <div key={b._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md text-center flex flex-col items-center">
                                <Ticket size={40} className="text-primary mb-3" />
                                <h3 className="text-lg font-bold text-dark dark:text-white">{b.eventId?.title || 'Removed Event'}</h3>
                                <p className="text-xs text-gray-400 mt-1">{b.eventId ? new Date(b.eventId.date).toLocaleDateString() : 'N/A'}</p>
                                
                                {b.qrCodeUrl && (
                                    <div className="border border-gray-150 dark:border-gray-700 p-3 bg-white rounded-2xl my-4">
                                        <img src={b.qrCodeUrl} alt="QR Code Ticket" className="w-40 h-40" />
                                    </div>
                                )}
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Confirmed</span>
                                <button onClick={() => handleDownloadTicket(b)} className="btn-primary w-full py-2 text-xs">Print Ticket PDF</button>
                            </div>
                        ))}
                        {userBookings.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">No active tickets found.</div>
                        )}
                    </div>
                );
            case 'Favorites':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.filter(e => favorites.includes(e._id)).map(e => (
                            <div key={e._id} className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-dark dark:text-white">{e.title}</h3>
                                    <p className="text-xs text-gray-500 mt-2">{e.location}</p>
                                </div>
                                <button onClick={() => handleBookEvent(e._id)} className="btn-primary mt-4 py-2 text-xs w-full">Book Now</button>
                            </div>
                        ))}
                        {favorites.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">Your favorites list is empty.</div>
                        )}
                    </div>
                );
            case 'Reviews & Ratings':
                return (
                    <div className="glass-panel p-6 max-w-lg mx-auto dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">Rate Completed Event</h2>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Select Event</label>
                                <select 
                                    value={reviewEventId} 
                                    onChange={(e) => setReviewEventId(e.target.value)}
                                    className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                    required
                                >
                                    <option value="">Choose an event...</option>
                                    {events.map(e => (
                                        <option key={e._id} value={e._id}>{e.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Rating (1 to 5 Stars)</label>
                                <div className="flex space-x-2 py-1">
                                    {[1,2,3,4,5].map(num => (
                                        <button 
                                            key={num} 
                                            type="button" 
                                            onClick={() => setRating(num)}
                                            className="text-yellow-400 hover:scale-110 transition-transform"
                                        >
                                            <Star size={24} className={num <= rating ? "fill-yellow-400" : ""} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Write your review</label>
                                <textarea 
                                    rows="4"
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                    placeholder="Tell others about your experience..."
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full py-3">Submit Review</button>
                        </form>
                    </div>
                );
            case 'Settings':
                return (
                    <div className="glass-panel p-6 max-w-lg mx-auto dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">User Account Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400">Account Type</label>
                                <p className="font-bold text-primary uppercase text-sm">{user.role}</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400">Registered Email</label>
                                <p className="font-bold text-dark dark:text-white">{user.email || 'user@ems.com'}</p>
                            </div>
                            <button onClick={() => setIsProfileModalOpen(true)} className="btn-primary py-2.5 px-4 text-xs">Edit User Profile</button>
                        </div>
                    </div>
                );
            case 'Dashboard':
            default:
                return (
                    <>
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Events</p>
                                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">{userBookings.length}</p>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-xl text-primary"><CheckSquare size={22} /></div>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Events</p>
                                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">{availableEvents.length}</p>
                                </div>
                                <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><Calendar size={22} /></div>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saved Events</p>
                                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">{savedEventsCount}</p>
                                </div>
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><Heart size={22} /></div>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tickets</p>
                                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">{userBookings.length}</p>
                                </div>
                                <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><Ticket size={22} /></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                {/* Registered/Upcoming Events */}
                                <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Upcoming Registered Events</h3>
                                    <div className="space-y-4">
                                        {userBookings.slice(0, 3).map(b => (
                                            <div key={b._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                <div>
                                                    <h4 className="font-bold text-dark dark:text-white">{b.eventId?.title || 'Removed Event'}</h4>
                                                    <p className="text-xs text-gray-400 mt-1">{b.eventId ? new Date(b.eventId.date).toLocaleDateString() : 'N/A'} • {b.eventId?.location}</p>
                                                </div>
                                                <button onClick={() => { setActiveTab('My Tickets') }} className="text-xs font-bold text-primary hover:underline flex items-center">
                                                    View Ticket <ArrowRight size={14} className="ml-1" />
                                                </button>
                                            </div>
                                        ))}
                                        {userBookings.length === 0 && (
                                            <p className="text-gray-500 text-sm text-center py-6">No registered events yet. Go to Browse Events to book ticket!</p>
                                        )}
                                    </div>
                                </div>

                                {/* Recommended Events */}
                                <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Recommended for You</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {events.filter(e => e.status === 'Active' && !userBookings.some(b => b.eventId?._id === e._id)).slice(0, 2).map(e => (
                                            <div key={e._id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex flex-col justify-between">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{e.category}</span>
                                                    <h4 className="font-bold text-dark dark:text-white mt-1">{e.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{e.location}</p>
                                                </div>
                                                <button onClick={() => handleBookEvent(e._id)} className="btn-primary py-2 mt-4 text-xs">Book Ticket - ${e.price}</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Recent Activity</h3>
                                    <div className="space-y-6">
                                        {userBookings.slice(0, 3).map((b, i) => (
                                            <div key={i} className="flex space-x-3 text-sm">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                                <div>
                                                    <p className="font-semibold text-dark dark:text-white">Registered for {b.eventId?.title || 'Event'}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(b.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {userBookings.length === 0 && (
                                            <p className="text-sm text-gray-400 text-center py-6">No recent registrations or booking activity.</p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setActiveTab('Browse Events')} className="w-full mt-6 py-2.5 text-sm text-primary font-bold hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 hover:border-primary/40">
                                    Explore More Events
                                </button>
                            </div>
                        </div>
                    </>
                );
        }
    };

    // -------------------------------------------------------------
    // RENDER 2: ORGANIZER DASHBOARD
    // -------------------------------------------------------------
    const renderOrganizerDashboard = () => {
        const totalEventsCount = organizerEvents.length;
        const activeEventsCount = organizerEvents.filter(e => e.status === 'Active').length;
        const totalAttendeesCount = bookings.length; // Already filtered for this organizer
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.eventId?.price || 0), 0);
        const totalRevenueValue = totalRevenue;

        switch (activeTab) {
            case 'Create Event':
                return (
                    <div className="glass-panel p-6 max-w-xl mx-auto dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">Create New Event</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = {
                                title: e.target.title.value,
                                date: e.target.date.value,
                                time: e.target.time.value,
                                location: e.target.location.value,
                                description: e.target.description.value,
                                category: e.target.category.value,
                                price: Number(e.target.price.value)
                            };
                            handleSaveEvent(formData);
                            e.target.reset();
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Event Title</label>
                                <input type="text" name="title" required className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="e.g. Annual Developers Conclave" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Date</label>
                                    <input type="date" name="date" required className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Time</label>
                                    <input type="time" name="time" required className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Venue Location</label>
                                <input type="text" name="location" required className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" placeholder="City or Online" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Description</label>
                                <textarea name="description" rows="3" required className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700 resize-none" placeholder="Provide detailed event description..."></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Category</label>
                                    <select name="category" className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700">
                                        <option value="Tech">Tech</option>
                                        <option value="Business">Business</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Ticket Price ($)</label>
                                    <input type="number" name="price" min="0" required defaultValue="0" className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary w-full py-3">Publish Event</button>
                        </form>
                    </div>
                );
            case 'Manage Events':
                return (
                    <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">Manage Events</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-3">
                                        <th className="pb-3">Event Name</th>
                                        <th className="pb-3">Date</th>
                                        <th className="pb-3">Category</th>
                                        <th className="pb-3">Price</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                    {organizerEvents.map(e => (
                                        <tr key={e._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="py-4 font-bold text-dark dark:text-white">{e.title}</td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">{new Date(e.date).toLocaleDateString()}</td>
                                            <td className="py-4 font-semibold text-gray-600 dark:text-gray-300">{e.category}</td>
                                            <td className="py-4 font-bold text-dark dark:text-white">${e.price}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${e.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right space-x-2">
                                                <button onClick={() => handleEditEvent(e)} className="text-xs text-primary font-bold hover:underline">Edit</button>
                                                <button onClick={() => handleDeleteEvent(e._id)} className="text-xs text-red-500 font-bold hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {organizerEvents.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">No events found. Go to Create Event to add one!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Attendees':
                return (
                    <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-dark dark:text-white">Attendee Management</h2>
                            <button 
                                onClick={handleExportAttendeesCSV}
                                className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark shadow"
                            >
                                Export Data (CSV)
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-3">
                                        <th className="pb-3">Name</th>
                                        <th className="pb-3">Email</th>
                                        <th className="pb-3">Event Registered</th>
                                        <th className="pb-3">Check-in Status</th>
                                        <th className="pb-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                    {bookings.map(b => (
                                        <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="py-4 font-bold text-dark dark:text-white">{b.userId?.name || 'Rahul Sharma (Demo)'}</td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">{b.userId?.email || 'user@ems.com'}</td>
                                            <td className="py-4 font-semibold text-gray-600 dark:text-gray-300">{b.eventId?.title || 'Removed Event'}</td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${b.isCheckedIn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {b.isCheckedIn ? 'Checked-In' : 'Not Checked-In'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <button onClick={() => handleToggleCheckIn(b._id)} className="text-xs text-primary font-bold hover:underline">
                                                    Toggle Check-in
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-gray-500">No attendees registered for your events yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Ticket Sales':
                return (
                    <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <h2 className="text-xl font-bold text-dark dark:text-white">Ticket Sales Ledger</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                                Total Tickets Sold: <span className="text-primary font-bold">{bookings.length}</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto text-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-3">
                                        <th className="pb-3">Ticket ID</th>
                                        <th className="pb-3">Event Name</th>
                                        <th className="pb-3">Buyer Name</th>
                                        <th className="pb-3">Purchase Date</th>
                                        <th className="pb-3">Price Paid</th>
                                        <th className="pb-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {bookings.map(b => (
                                        <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="py-4 font-mono text-xs text-gray-500 dark:text-gray-400">TKT-{b._id.slice(-6).toUpperCase()}</td>
                                            <td className="py-4 font-bold text-dark dark:text-white">{b.eventId?.title || 'Removed Event'}</td>
                                            <td className="py-4 font-semibold text-gray-600 dark:text-gray-300">
                                                <div>{b.userId?.name || 'Attendee'}</div>
                                                <div className="text-[10px] text-gray-400">{b.userId?.email || ''}</div>
                                            </td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 font-bold text-dark dark:text-white">${b.eventId?.price || 0}</td>
                                            <td className="py-4 text-right">
                                                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">Paid</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">No ticket sales recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Revenue':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Ticket Revenue</p>
                                <p className="text-3xl font-bold text-dark dark:text-white mt-1">${totalRevenueValue.toFixed(2)}</p>
                                <p className="text-xs text-green-500 mt-2">Live sync active</p>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Withdrawable Balance</p>
                                <p className="text-3xl font-bold text-dark dark:text-white mt-1">${(totalRevenueValue * 0.9).toFixed(2)}</p>
                                <p className="text-xs text-gray-500 mt-2">Deducted 10% platform fee</p>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Bank Transfers</p>
                                <p className="text-3xl font-bold text-dark dark:text-white mt-1">$0.00</p>
                                <p className="text-xs text-gray-500 mt-2">All settlements completed</p>
                            </div>
                        </div>

                        <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Financial Payout Ledger</h3>
                            <div className="overflow-x-auto text-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-2">
                                            <th className="pb-2">Details</th>
                                            <th className="pb-2">Commission (10%)</th>
                                            <th className="pb-2 text-right">Net Revenue Payout</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        <tr>
                                            <td className="py-4 font-bold text-dark dark:text-white">Gross Ticket Sales</td>
                                            <td className="py-4 font-semibold text-red-500">-${(totalRevenueValue * 0.1).toFixed(2)}</td>
                                            <td className="py-4 font-bold text-green-500 text-right">${(totalRevenueValue * 0.9).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Request Bank Transfer Box */}
                        <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700 max-w-lg mx-auto">
                            <h3 className="text-lg font-bold text-dark dark:text-white mb-4 text-center">Request Bank Transfer Payout</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                alert(`Payout of $${(totalRevenueValue * 0.9).toFixed(2)} requested successfully!\nTransfer will settle in 2-3 business days.`);
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Select Bank Account</label>
                                    <select required className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700">
                                        <option value="HDFC">HDFC Bank Savings (•••• 9843)</option>
                                        <option value="ICICI">ICICI Bank Checking (•••• 5521)</option>
                                        <option value="PAYPAL">PayPal Payout Account (organizer@ems.com)</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary w-full py-3" disabled={totalRevenueValue === 0}>
                                    Withdraw Net Balance (${(totalRevenueValue * 0.9).toFixed(2)})
                                </button>
                            </form>
                        </div>
                    </div>
                );
            case 'Reports':
                return (
                    <div className="glass-panel p-6 max-w-md mx-auto text-center dark:bg-gray-800/70 dark:border-gray-700">
                        <FileText className="mx-auto text-primary mb-4" size={48} />
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-2">Event Performance Reports</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Generate full performance, attendee, and tax revenue reports.</p>
                        <button onClick={() => alert("Report generated successfully! Download scheduled.")} className="btn-primary w-full py-3">Generate & Download PDF Report</button>
                    </div>
                );
            case 'Settings':
                return (
                    <div className="glass-panel p-6 max-w-lg mx-auto dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">Organizer Settings</h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block text-sm text-gray-400">Company Name</label>
                                <p className="font-bold text-dark dark:text-white">{user.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400">Account Type</label>
                                <p className="font-bold text-primary uppercase">{user.role}</p>
                            </div>
                            <button onClick={() => setIsProfileModalOpen(true)} className="btn-primary py-2 px-4 text-xs">Edit Organizer Details</button>
                        </div>
                    </div>
                );
            case 'Dashboard':
            default:
                return (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Events</p>
                                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">{totalEventsCount}</p>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-xl text-primary"><Calendar size={22} /></div>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Events</p>
                                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">{activeEventsCount}</p>
                                </div>
                                <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><Activity size={22} /></div>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Attendees</p>
                                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">{totalAttendeesCount}</p>
                                </div>
                                <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><Users size={22} /></div>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue Generated</p>
                                    <p className="text-3xl font-bold text-dark dark:text-white mt-1">${totalRevenueValue}</p>
                                </div>
                                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><DollarSign size={22} /></div>
                            </div>
                        </div>

                        {/* Event Management Table */}
                        <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-dark dark:text-white">Active Events Ledger</h3>
                                <button onClick={() => setActiveTab('Create Event')} className="text-xs font-bold text-primary hover:underline">+ Create Event</button>
                            </div>
                            <div className="overflow-x-auto text-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-2">
                                            <th className="pb-2">Event</th>
                                            <th className="pb-2">Date</th>
                                            <th className="pb-2 text-center">Registrations</th>
                                            <th className="pb-2">Revenue</th>
                                            <th className="pb-2">Status</th>
                                            <th className="pb-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {organizerEvents.map(e => {
                                            const eventBookings = bookings.filter(b => b.eventId?._id === e._id);
                                            return (
                                                <tr key={e._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                    <td className="py-4 font-bold text-dark dark:text-white">{e.title}</td>
                                                    <td className="py-4 text-gray-500 dark:text-gray-400">{new Date(e.date).toLocaleDateString()}</td>
                                                    <td className="py-4 text-center font-bold text-dark dark:text-white">{eventBookings.length}</td>
                                                    <td className="py-4 font-bold text-green-500">${eventBookings.length * e.price}</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${e.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {e.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right space-x-3 font-semibold text-xs">
                                                        <button onClick={() => handleEditEvent(e)} className="text-primary hover:underline">Edit</button>
                                                        <button onClick={() => handleDeleteEvent(e._id)} className="text-red-500 hover:underline">Delete</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {organizerEvents.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-6 text-gray-500">No events found. Click Create Event to seed.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Dynamic Registration Graph */}
                        <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Daily Ticket Registrations Analytics</h3>
                            <div className="flex items-end justify-between h-48 space-x-2 pt-6">
                                {[3, 8, 12, 18, 9, 15, 22].map((val, i) => (
                                    <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                        <div className="w-full h-full relative flex justify-center items-end group-hover:opacity-80 transition-opacity">
                                            <div 
                                                className="w-full max-w-[24px] bg-primary rounded-t-md relative transition-all duration-500" 
                                                style={{ height: `${(val / 25) * 100}%` }}
                                            >
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-dark text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{val} tickets</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-2 font-medium">Day {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                );
        }
    };

    // -------------------------------------------------------------
    // RENDER 3: ADMIN (SUPER ADMIN) DASHBOARD
    // -------------------------------------------------------------
    const renderAdminDashboard = () => {
        const totalUsersCount = allUsers.length;
        const totalOrganizersCount = allUsers.filter(u => u.role === 'Organizer').length;
        const totalEventsCount = events.length;
        const totalRevenueValue = bookings.reduce((sum, b) => sum + (b.eventId?.price || 0), 0);

        switch (activeTab) {
            case 'Users': {
                const attendees = allUsers.filter(u => u.role === 'User');
                return (
                    <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">System Attendees (Users)</h2>
                        <div className="overflow-x-auto text-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-2">
                                        <th className="pb-2">Name</th>
                                        <th className="pb-2">Email</th>
                                        <th className="pb-2">Registered Role</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {attendees.map(u => (
                                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="py-4 font-bold text-dark dark:text-white">{u.name}</td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                            <td className="py-4 font-semibold text-gray-600 dark:text-gray-300">
                                                <select 
                                                    value={u.role} 
                                                    onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-primary cursor-pointer p-0"
                                                >
                                                    <option value="User">User</option>
                                                    <option value="Organizer">Organizer</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {u.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <button 
                                                    onClick={() => handleToggleBlock(u._id)} 
                                                    className={`text-xs font-bold hover:underline ${u.isBlocked ? 'text-green-500' : 'text-red-500'}`}
                                                >
                                                    {u.isBlocked ? 'Unblock Account' : 'Block User'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {attendees.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-6 text-gray-500">No registered attendees (users) found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }
            case 'Organizers': {
                const organizers = allUsers.filter(u => u.role === 'Organizer');
                return (
                    <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">System Event Organizers</h2>
                        <div className="overflow-x-auto text-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-2">
                                        <th className="pb-2">Name</th>
                                        <th className="pb-2">Email</th>
                                        <th className="pb-2">Registered Role</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {organizers.map(u => (
                                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="py-4 font-bold text-dark dark:text-white">{u.name}</td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                            <td className="py-4 font-semibold text-gray-600 dark:text-gray-300">
                                                <select 
                                                    value={u.role} 
                                                    onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-primary cursor-pointer p-0"
                                                >
                                                    <option value="User">User</option>
                                                    <option value="Organizer">Organizer</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {u.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <button 
                                                    onClick={() => handleToggleBlock(u._id)} 
                                                    className={`text-xs font-bold hover:underline ${u.isBlocked ? 'text-green-500' : 'text-red-500'}`}
                                                >
                                                    {u.isBlocked ? 'Unblock Account' : 'Block User'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {organizers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-6 text-gray-500">No registered organizers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }
            case 'Events':
                return (
                    <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">Event Monitoring & Approvals</h2>
                        <div className="overflow-x-auto text-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-2">
                                        <th className="pb-2">Event Title</th>
                                        <th className="pb-2">Organizer</th>
                                        <th className="pb-2">Price</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {events.map(e => (
                                        <tr key={e._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="py-4 font-bold text-dark dark:text-white">{e.title}</td>
                                            <td className="py-4 text-gray-500 dark:text-gray-400">{e.organizerId?.name || 'EMS Organizer'}</td>
                                            <td className="py-4 font-bold text-dark dark:text-white">${e.price}</td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${e.status === 'Active' ? 'bg-green-100 text-green-800' : e.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right space-x-2 font-bold text-xs">
                                                <button onClick={() => handleUpdateEventStatus(e._id, 'Active')} className="text-green-500 hover:underline">Approve</button>
                                                <button onClick={() => handleUpdateEventStatus(e._id, 'Suspended')} className="text-red-500 hover:underline">Suspend</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Categories':
                return (
                    <div className="glass-panel p-6 max-w-md mx-auto dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">Manage Event Categories</h2>
                        <ul className="space-y-3 text-sm">
                            {['Tech', 'Business', 'Entertainment', 'General'].map(cat => (
                                <li key={cat} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                    <span className="font-bold text-dark dark:text-white">{cat}</span>
                                    <span className="text-xs text-gray-400">{events.filter(e => e.category === cat).length} active events</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 'Payments':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform Gross Volume</p>
                                <p className="text-3xl font-bold text-dark dark:text-white mt-1">${totalRevenueValue}</p>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Commission Profit (10%)</p>
                                <p className="text-3xl font-bold text-green-500 mt-1">${totalRevenueValue * 0.1}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'Reports': {
                // Get event registration sizes
                const reportEvents = events.map(e => {
                    const count = bookings.filter(b => b.eventId?._id === e._id).length;
                    return {
                        title: e.title,
                        organizer: e.organizerId?.name || 'N/A',
                        registrations: count,
                        revenue: count * e.price,
                        category: e.category
                    };
                }).sort((a, b) => b.registrations - a.registrations);

                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Performing Event</p>
                                <p className="text-xl font-bold text-dark dark:text-white mt-1 line-clamp-1">{reportEvents[0]?.title || 'None'}</p>
                                <p className="text-xs text-green-500 mt-2">{reportEvents[0]?.registrations || 0} Registrations</p>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Most Active Category</p>
                                <p className="text-2xl font-bold text-dark dark:text-white mt-1">Tech</p>
                                <p className="text-xs text-gray-400 mt-2">Leading other segments by 45%</p>
                            </div>
                            <div className="glass-panel p-5 dark:bg-gray-800/70 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reports Status</p>
                                <p className="text-2xl font-bold text-green-500 mt-1">All Systems Normal</p>
                                <p className="text-xs text-gray-400 mt-2">Active DB Sync: Live</p>
                            </div>
                        </div>

                        {/* Top Events Leaderboard */}
                        <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Top Performing Events Leaderboard</h3>
                            <div className="overflow-x-auto text-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-150 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase pb-2">
                                            <th className="pb-2">Event Title</th>
                                            <th className="pb-2">Organizer</th>
                                            <th className="pb-2">Category</th>
                                            <th className="pb-2 text-center">Registrations</th>
                                            <th className="pb-2 text-right">Revenue Generated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {reportEvents.slice(0, 5).map((e, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                <td className="py-4 font-bold text-dark dark:text-white flex items-center">
                                                    <span className="w-5 h-5 bg-primary/15 text-primary text-xs font-bold rounded-full flex items-center justify-center mr-3 shrink-0">{index + 1}</span>
                                                    <span className="line-clamp-1">{e.title}</span>
                                                </td>
                                                <td className="py-4 text-gray-500 dark:text-gray-400">{e.organizer}</td>
                                                <td className="py-4 font-semibold text-gray-600 dark:text-gray-300">{e.category}</td>
                                                <td className="py-4 text-center font-bold text-dark dark:text-white">{e.registrations}</td>
                                                <td className="py-4 font-bold text-green-500 text-right">${e.revenue}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Report Export Box */}
                        <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700 max-w-lg mx-auto">
                            <h3 className="text-lg font-bold text-dark dark:text-white mb-4 text-center">Export Custom Report</h3>
                            <form onSubmit={handleExportReport} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Report Data Segment</label>
                                    <select name="reportType" className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700">
                                        <option value="Financial & Revenue Audits">Financial & Revenue Audits</option>
                                        <option value="Event Occupancy & Registrations">Event Occupancy & Registrations</option>
                                        <option value="User Login & Activity Logs">User Login & Activity Logs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Date Range</label>
                                    <select name="range" className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700">
                                        <option value="Last 7 Days">Last 7 Days</option>
                                        <option value="Last 30 Days">Last 30 Days</option>
                                        <option value="All Time">All Time</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary w-full py-3">Download System Report (CSV)</button>
                            </form>
                        </div>
                    </div>
                );
            }
            case 'System Settings': {
                return (
                    <div className="glass-panel p-6 max-w-lg mx-auto dark:bg-gray-800/70 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-6">Interactive System Settings</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            alert("System parameters saved successfully!");
                        }} className="space-y-6 text-sm">
                            <div className="space-y-2">
                                <label className="block font-semibold text-gray-600 dark:text-gray-300">Platform Booking Commission (%)</label>
                                <input 
                                    type="number" 
                                    value={systemSettings.commission} 
                                    onChange={(e) => setSystemSettings({...systemSettings, commission: Number(e.target.value)})}
                                    className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" 
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div>
                                    <p className="font-bold text-dark dark:text-white">Auto-Approve Created Events</p>
                                    <p className="text-xs text-gray-400">Newly created events will bypass Admin approval</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={systemSettings.autoApprove}
                                    onChange={(e) => setSystemSettings({...systemSettings, autoApprove: e.target.checked})}
                                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div>
                                    <p className="font-bold text-dark dark:text-white">Platform Maintenance Mode</p>
                                    <p className="text-xs text-gray-400">Suspend public registrations and booking actions</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={systemSettings.maintenanceMode}
                                    onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div>
                                    <p className="font-bold text-dark dark:text-white">Allow Public User Registrations</p>
                                    <p className="text-xs text-gray-400">Open registration endpoints to new attendees</p>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={systemSettings.allowRegistration}
                                    onChange={(e) => setSystemSettings({...systemSettings, allowRegistration: e.target.checked})}
                                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                />
                            </div>

                            <button type="submit" className="btn-primary w-full py-3">Save Platform Parameters</button>
                        </form>
                    </div>
                );
            }
            case 'Audit Logs': {
                const filteredLogs = auditLogs.filter(log => {
                    const matchesSearch = log.details.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
                        log.action.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
                        log.performedBy?.name?.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
                        log.performedBy?.email?.toLowerCase().includes(logsSearchTerm.toLowerCase());
                        
                    const matchesAction = logsFilterAction === 'All' || log.action === logsFilterAction;
                    return matchesSearch && matchesAction;
                });

                // Unique actions for filters
                const uniqueActions = ['All', ...new Set(auditLogs.map(l => l.action))];

                return (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150 dark:border-gray-700">
                            <div className="relative w-full md:w-1/3">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search logs by keyword or email..." 
                                    value={logsSearchTerm}
                                    onChange={(e) => setLogsSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                                />
                            </div>
                            <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
                                {uniqueActions.slice(0, 5).map(act => (
                                    <button 
                                        key={act}
                                        onClick={() => setLogsFilterAction(act)}
                                        className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-colors ${logsFilterAction === act ? 'bg-primary text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                                    >
                                        {act}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Database Audit Logs Viewer</h3>
                            <div className="overflow-x-auto text-xs font-mono text-gray-600 dark:text-gray-300">
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {filteredLogs.map(log => {
                                        let badgeColor = 'bg-blue-100 text-blue-800';
                                        if (log.action.includes('ERROR')) badgeColor = 'bg-red-100 text-red-800';
                                        else if (log.action.includes('REGISTERED') || log.action.includes('CONFIRMED') || log.action.includes('CREATED')) badgeColor = 'bg-green-100 text-green-800';
                                        else if (log.action.includes('BLOCKED') || log.action.includes('DELETED')) badgeColor = 'bg-red-100 text-red-800';
                                        else if (log.action.includes('UPDATED')) badgeColor = 'bg-yellow-100 text-yellow-800';

                                        return (
                                            <div key={log._id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${badgeColor}`}>
                                                            {log.action}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="font-semibold text-dark dark:text-white">{log.details}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-primary">{log.performedBy?.name || 'System'}</p>
                                                    <p className="text-[10px] text-gray-400">{log.performedBy?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredLogs.length === 0 && (
                                        <p className="text-center py-6 text-gray-500">No matching audit logs found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            case 'Dashboard':
            default:
                return (
                    <>
                        {/* Global Statistics Grid */}
                        <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700 mb-8">
                            <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Platform Global Statistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Total Users</p>
                                    <p className="text-2xl font-bold text-dark dark:text-white mt-1">{totalUsersCount}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Total Organizers</p>
                                    <p className="text-2xl font-bold text-dark dark:text-white mt-1">{totalOrganizersCount}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Total Events</p>
                                    <p className="text-2xl font-bold text-dark dark:text-white mt-1">{totalEventsCount}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Platform Revenue</p>
                                    <p className="text-2xl font-bold text-green-500 mt-1">${totalRevenueValue}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Pending Event Approvals */}
                            <div className="lg:col-span-2 glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Pending Event Approval Requests</h3>
                                <div className="space-y-4">
                                    {events.filter(e => e.status === 'Pending Approval').map(e => (
                                        <div key={e._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                            <div>
                                                <h4 className="font-bold text-dark dark:text-white">{e.title}</h4>
                                                <p className="text-xs text-gray-400 mt-1">Organizer: {e.organizerId?.name || 'N/A'}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleUpdateEventStatus(e._id, 'Active')} className="text-xs px-3 py-1.5 bg-green-500 text-white rounded font-bold">Approve</button>
                                                <button onClick={() => handleUpdateEventStatus(e._id, 'Suspended')} className="text-xs px-3 py-1.5 bg-red-500 text-white rounded font-bold">Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                    {events.filter(e => e.status === 'Pending Approval').length === 0 && (
                                        <p className="text-center py-6 text-gray-500 text-sm">All events approved. No pending approval requests found.</p>
                                    )}
                                </div>
                            </div>

                            {/* Organizer Registrations approvals */}
                            <div className="glass-panel p-6 dark:bg-gray-800/70 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Admin Monitoring Audit Logs</h3>
                                <div className="space-y-4 text-xs font-mono text-gray-500">
                                    <p>• System: Auto-seeder loaded.</p>
                                    <p>• Auth: Token verification verified.</p>
                                    <p>• Admin: Global variables loaded.</p>
                                </div>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="flex h-screen bg-background dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-colors duration-200 shrink-0">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-primary mb-8">EMS</h2>
                    <ul className="space-y-3">
                        {getSidebarTabs().map((tab) => (
                            <li 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`font-semibold cursor-pointer transition-colors text-sm py-1.5 ${activeTab === tab ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-primary'}`}
                            >
                                {tab}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                    <div 
                        className="flex items-center space-x-3 mb-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-xl transition-colors -mx-2"
                        onClick={() => setIsProfileModalOpen(true)}
                    >
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-secondary/20 uppercase">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-dark dark:text-white group-hover:text-primary transition-colors line-clamp-1">{user.name}</p>
                            <span className="inline-block text-[9px] font-bold text-primary uppercase bg-primary/15 px-2 py-0.5 rounded-full mt-0.5">{user.role}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                        <button onClick={handleLogout} className="text-red-500 text-sm font-semibold hover:underline text-left">
                            Log out
                        </button>
                        
                        <button 
                            onClick={toggleTheme} 
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-dark dark:text-white transition-colors duration-200">Hello, {user.name.split(' ')[0]} 👋</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {isUser && "Explore and book the best events in town."}
                            {isOrganizer && "Here is what's happening with your events today."}
                            {isAdmin && "Global platform administration overview."}
                        </p>
                    </div>
                    {isOrganizer && (
                        <button 
                            onClick={handleOpenCreateModal}
                            className="btn-primary"
                        >
                            + Add New Event
                        </button>
                    )}
                </header>

                {isUser && renderUserDashboard()}
                {isOrganizer && renderOrganizerDashboard()}
                {isAdmin && renderAdminDashboard()}

            </div>

            <EventModal 
                isOpen={isEventModalOpen} 
                onClose={() => {
                    setIsEventModalOpen(false);
                    setEditingEvent(null);
                }} 
                onSave={handleSaveEvent}
                initialData={editingEvent}
            />

            {/* User Profile Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-dark dark:text-white">
                                {isEditingProfile ? 'Edit Profile' : 'User Profile'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setIsProfileModalOpen(false);
                                    setIsEditingProfile(false);
                                }} 
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        
                        {!isEditingProfile ? (
                            <>
                                <div className="flex flex-col items-center mb-8 relative">
                                    <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-secondary/30 mb-4 border-4 border-white dark:border-gray-800 uppercase">
                                        {profileData.name.charAt(0)}
                                    </div>
                                    <button 
                                        onClick={() => setIsEditingProfile(true)}
                                        className="absolute top-0 right-1/4 bg-white dark:bg-gray-700 p-2 rounded-full shadow border border-gray-100 dark:border-gray-600 text-gray-500 hover:text-primary transition-colors"
                                        title="Edit Profile"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <h3 className="text-2xl font-bold text-dark dark:text-white">{profileData.name}</h3>
                                    <span className="bg-primary/10 text-primary dark:bg-primary/20 px-3 py-1 rounded-full text-xs font-bold mt-2 uppercase tracking-wide">
                                        {user.role}
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                                        <p className="font-semibold text-dark dark:text-white">{profileData.email}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Account Status</label>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                            <p className="font-semibold text-dark dark:text-white">Active</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-8 flex justify-end">
                                    <button onClick={() => setIsProfileModalOpen(false)} className="px-5 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        Close
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                alert(`Profile updated to: ${profileData.name}, ${profileData.email}`);
                                setIsEditingProfile(false);
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        className="input-field dark:bg-gray-900 dark:text-white dark:border-gray-700" 
                                    />
                                </div>
                                <div className="pt-4 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold">Cancel</button>
                                    <button type="submit" className="btn-primary">Save Profile</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
