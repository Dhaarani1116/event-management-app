import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- CONFIGURATION AND SETUP ---
// Color Palette (College Branding)
const COLORS = {
  primary: '#1755A7', // Deep Blue (Sri Eshwar Primary)
  secondary: '#F9B318', // Bright Orange/Gold (Accent)
  success: '#10B981', // Green for approved status
  danger: '#EF4444', // Red for rejected/conflict status
};

const COLLEGE_NAME = "Sri Eshwar";

// IMPORTANT: Updated API Key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";

const QR_CODE_API = (text) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;

// Placeholder for Event Posters (Must be dynamic based on event category)
const EVENT_POSTER_PLACEHOLDER = (category) => {
    const color = category === 'Technical' ? '1755A7' : 'F9B318';
    const text = category === 'Technical' ? 'Tech%20Event' : 'Non-Tech';
    return `https://placehold.co/400x200/${color}/ffffff?text=${text}`;
};

// --- ICON LIBRARY (Inline SVG) ---
const icons = {
  Home: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Calendar: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Users: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  BarChart: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Plus: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  CheckCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  LogOut: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  ListChecks: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 2 2 4-4"/><path d="M21 15.5a2.5 2.5 0 0 0-2.5-2.5H12"/><path d="m3 8 2 2 4-4"/><path d="M21 9.5a2.5 2.5 0 0 0-2.5-2.5H12"/></svg>,
  // FIXED SVG
  Sparkles: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7a5 5 0 0 0-5 5c0 1.25.5 2.5 1.46 3.54L12 17l3.54-1.46A5 5 0 0 0 17 12a5 5 0 0 0-5-5zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  // CORRECTED SVG: Phone icon fixed to resolve JSX parsing error
  Phone: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.73v5.63a2 2 0 0 1-.74 1.58L5.75 12.39a10 10 0 0 0 6 6l1.3-1.3c.48-.48 1.15-.76 1.84-.76h5.63a2 2 0 0 1 1.72 2v3z"/></svg>,
  Mail: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  ArrowLeft: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  UserPlus: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  ClipboardCheck: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v1h8V3a1 1 0 0 0-1-1z"/><path d="m9 12 2 2 4-4"/></svg>,
  Layers: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-9-7 9-7 9 7-9 7z"/><path d="m12 19-9-7 9-7 9 7-9 7z" opacity="0.5"/><path d="M12 14 3 7M21 7 12 14"/></svg>,
  Link: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Edit: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Trash: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
};

// --- CONSTANT DATA ---
const DEPARTMENT_OPTIONS = [
    { _id: 'AI&DS', name: 'AI & Data Science' },
    { _id: 'AI&ML', name: 'AI & Machine Learning' },
    { _id: 'CSE', name: 'Computer Science Engineering' },
    { _id: 'CYS', name: 'CSE (Cyber Security)' },
    { _id: 'CCE', name: 'Computer Communication Engineering' },
    { _id: 'CSBS', name: 'Computer Science and Business Systems' },
    { _id: 'ECE', name: 'Electronics and Communication Engineering' },
    { _id: 'EEE', name: 'Electrical and Electronics Engineering' },
    { _id: 'MECH', name: 'Mechanical Engineering' },
    { _id: 'SLC', name: 'Student Leadership Council Members (SLC)' },
    { _id: 'CFI', name: 'Centre for Innovation' },
    { _id: 'Other', name: 'Other/General' },
];

const YEAR_OPTIONS = [
    { _id: '1st', name: '1st Year' },
    { _id: '2nd', name: '2nd Year' },
    { _id: '3rd', name: '3rd Year' },
    { _id: '4th', name: '4th Year' },
];

// --- MOCK DATA FOR LOCAL STORAGE PERSISTENCE ---

// Updated Venue List with increased capacities
const VENUE_LIST = [
    { _id: 'r1', name: '1st Floor Auditorium', capacity: 600 },
    { _id: 'r2', name: '2nd Floor Auditorium', capacity: 500 }, 
    { _id: 'r3', name: 'Inner Courtyard', capacity: 1000 },
    { _id: 'r4', name: 'OAT', capacity: 1500 },
    { _id: 'r5', name: 'Vista Hall', capacity: 250 }, 
    { _id: 'r9', name: 'Robo Space', capacity: 170 }, 
    { _id: 'r6', name: 'Code Studio', capacity: 140 }, 
    { _id: 'r7', name: 'Synapse Studio', capacity: 160 }, 
    { _id: 'r8', name: 'MakerSpace', capacity: 100 }, 
];

const MOCK_DATA = {
    users: [
        { _id: 'mock-admin-id', role: 'Admin', email: 'admin@sri-eshwar.edu', displayName: 'Dr. Head', department: 'Admin', interests: ['Management'], pass: 'Admin#2025' },
        { _id: 'mock-coord-id', role: 'Coordinator', email: 'prof.smith@sri-eshwar.edu', displayName: 'Prof. Smith', department: 'MECH', interests: ['Management', 'Engineering'], pass: 'Coord@123' },
        { _id: 's3-coord-id', role: 'Coordinator', email: 'priya.m@sri-eshwar.edu', displayName: 'Priya M.', department: 'CSE', interests: ['Culture'], pass: 'Coord@456' },
        // FIX: Student Password Updated
        { _id: 'mock-student-id', role: 'Student', email: 'adya.s@sri-eshwar.edu', displayName: 'Adya Sharma', department: 'CSE', interests: ['Tech', 'Culture'], pass: 'Student@2025' },
        { _id: 's2', role: 'Student', email: 'bala.v@sri-eshwar.edu', displayName: 'Bala V.', department: 'EEE', interests: ['Tech'], pass: 'Student#2' },
    ],
    resources: VENUE_LIST,
    events: [
        // COMPOUND EVENT EXAMPLE (Parent)
        { _id: 'c1', title: 'Navaratri Tech & Cultural Fest', description: 'A celebration of technology, art, and tradition across nine days.', date: '2025-10-20', startTime: '09:00', endTime: '20:00', venueId: 'r3', expectedAttendance: 1000, coordinator_id: 'mock-admin-id', department: 'Other', category: 'Compound', coordName: 'Dr. Head', coordPhone: '9990001111', tags: ['Fest', 'All'], status: 'Approved', createdAt: Date.now() - 300000000, isTeamEvent: false, maxTeamSize: 1, posterUrl: 'https://placehold.co/400x200/F9B318/1755A7?text=Navaratri%20Fest', coCoordinators: [], isParent: true, websiteUrl: 'https://navaratrifest.sri-eshwar.edu' },
        
        // SUB-EVENT 1 (Under c1) - Coordinated by Prof. Smith (MECH)
        { _id: 'c1-s1', parentId: 'c1', title: 'Navaratri Tech & Cultural Fest - Web Development Workshop', description: 'Deep dive into Python and FastAPI.', date: '2025-10-21', startTime: '10:00', endTime: '13:00', venueId: 'r6', expectedAttendance: 35, coordinator_id: 'mock-coord-id', department: 'CSE', category: 'Technical', coordName: 'Prof. Smith', coordPhone: '9876543210', tags: ['Tech', 'AI'], status: 'Approved', createdAt: Date.now() - 86400000, isTeamEvent: false, maxTeamSize: 1, posterUrl: '', coCoordinators: [{name: 'Murali R.', phone: '9009009009', department: 'CSE'}], websiteUrl: '' },
        
        // SUB-EVENT 2 (Under c1) - Team Event, Coordinated by Priya M. (CSE)
        { _id: 'c1-s2', parentId: 'c1', title: 'Navaratri Tech & Cultural Fest - Dance Battle Auditions (Team)', description: 'Auditions for the annual cultural dance competition.', date: '2025-10-22', startTime: '15:00', endTime: '17:00', venueId: 'r2', expectedAttendance: 100, coordinator_id: 's3-coord-id', department: 'CFI', category: 'Non-Technical', coordName: 'Priya M.', coordPhone: '9988776655', tags: ['Culture'], status: 'Approved', createdAt: Date.now() - 172800000, isTeamEvent: true, maxTeamSize: 5, posterUrl: '', 
            coCoordinators: [
                { name: 'Arun S.', phone: '9991112223', department: 'ECE' },
            ],
            websiteUrl: '' 
        },
        
        // Standalone Event (Not part of a Compound Event) - Coordinated by Prof. Smith (MECH)
        { _id: 'e3', title: 'Annual Sports Meet', description: 'Final matches of the inter-department cricket and football tournaments.', date: '2025-11-20', startTime: '16:00', endTime: '18:00', venueId: 'r4', expectedAttendance: 500, coordinator_id: 'mock-coord-id', department: 'Sports', category: 'Non-Technical', coordName: 'Prof. Smith', coordPhone: '9000111222', tags: ['Sports'], status: 'Pending', createdAt: Date.now() - 259200000, isTeamEvent: false, maxTeamSize: 1, posterUrl: '', coCoordinators: [], websiteUrl: '' },
    ],
    // Attendance Records
    attendanceRecords: [
        { id: 'a1', eventId: 'c1-s1', userId: 'mock-student-id', is_present: true, regName: 'Adya Sharma', regDept: 'CSE', regYear: '3rd', regPhone: '9998887776', regEmail: 'adya.s@sri-eshwar.edu', teamName: 'Individual', teamSize: 1, teamMembers: [] },
        // Mock team registration for c1-s2 (Leader: Adya)
        { 
            id: 'a2', eventId: 'c1-s2', userId: 'mock-student-id', is_present: false, regName: 'Adya Sharma', regDept: 'CSE', regYear: '3rd', regPhone: '9998887776', regEmail: 'adya.s@sri-eshwar.edu', 
            teamName: 'Cosmic Crew', teamSize: 3, 
            teamMembers: [
                { name: 'Adya Sharma', email: 'adya.s@sri-eshwar.edu', dept: 'CSE', year: '3rd' }, // Leader
                { name: 'Ravi K.', email: 'ravi.k@sri-eshwar.edu', dept: 'ECE', year: '3rd' },
                { name: 'Priya L.', email: 'priya.l@sri-eshwar.edu', dept: 'AI&DS', year: '2nd' },
            ] 
        }, 
        // Mock team registration for c1-s2 (Leader: Bala)
        { 
            id: 'a3', eventId: 'c1-s2', userId: 's2', is_present: false, regName: 'Bala V.', regDept: 'EEE', regYear: '4th', regPhone: '9111222333', regEmail: 'bala.v@sri-eshwar.edu', 
            teamName: 'EEE Thunder', teamSize: 2,
            teamMembers: [
                { name: 'Bala V.', email: 'bala.v@sri-eshwar.edu', dept: 'EEE', year: '4th' }, // Leader
                { name: 'Jagan P.', email: 'jagan.p@sri-eshwar.edu', dept: 'EEE', year: '4th' },
            ] 
        }, 
    ],
    feedback: [
        { id: 'f1', eventId: 'c1-s1', userId: 'mock-student-id', rating: 5, comment: "Fantastic speakers, but the main hall felt crowded. Great content!" },
        { id: 'f2', eventId: 'c1-s1', userId: 's2', rating: 4, comment: "Loved the robotics demo. Lunch break was too short." },
        { id: 'f3', eventId: 'e3', userId: 's3', rating: 3, comment: "The exposition was okay, but the lighting was poor, making it hard to see the screen." },
        { id: 'f4', eventId: 'c1-s1', userId: 's4', rating: 5, comment: "The best symposium yet! Very organized and informative." },
    ]
};

// --- DATA UTILITIES (Using localStorage for persistence) ---
const STORAGE_KEY = 'icc_mock_data';

const getInitialData = () => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    }
    // Initialize with mock data and save to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
    return MOCK_DATA;
};


// --- GLOBAL STATE MANAGEMENT (React Context) ---
const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [data, setData] = useState(getInitialData());
  const [authState, setAuthState] = useState({
    isAuthReady: false,
    isAuthenticated: false,
    currentUser: null,
    currentRole: 'Public', 
    currentView: 'login',
    modal: null,
    error: null,
  });

  const updateState = useCallback((updates) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  // Update Data and trigger re-render
  const updateData = useCallback((key, newData) => {
    setData(prev => {
        const newState = { ...prev, [key]: newData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        return newState;
    });
  }, []);
  
  // New: Update Attendance Status
  const updateAttendanceStatus = useCallback((attendanceId, isPresent) => {
    const newRecords = data.attendanceRecords.map(a => 
        a.id === attendanceId ? { ...a, is_present: isPresent } : a
    );
    updateData('attendanceRecords', newRecords);
  }, [data.attendanceRecords, updateData]);

  const changeView = useCallback((newView) => {
    updateState({ currentView: newView, modal: null });
  }, [updateState]);

  const showModal = useCallback((content, size = 'sm') => {
    updateState({ modal: { content, size } });
  }, [updateState]);

  const closeModal = useCallback(() => {
    updateState({ modal: null });
  }, [updateState]);
  
  // Custom Edit Handler
  const editEvent = useCallback((updatedEvent, newSubEvents = []) => {
      let newEvents = [...data.events];
      
      // 1. Delete the old version of the event (and its subs if Parent)
      newEvents = newEvents.filter(e => e._id !== updatedEvent._id && e.parentId !== updatedEvent._id);
      
      // 2. Add the updated parent event
      newEvents.push(updatedEvent);
      
      // 3. Add the updated (or newly created) sub-events
      newEvents.push(...newSubEvents);
      
      updateData('events', newEvents);
      closeModal();
  }, [data.events, updateData, closeModal]);

  // NEW: Delete Handler
  const deleteEvent = useCallback((eventId) => {
      const eventToDelete = data.events.find(e => e._id === eventId);
      if (!eventToDelete) return;
      
      const isCompoundEvent = eventToDelete.isParent;
      
      // Filter out the main event
      let newEvents = data.events.filter(e => e._id !== eventId);
      
      // If it's a Compound Event, filter out all its sub-events
      if (isCompoundEvent) {
          newEvents = newEvents.filter(e => e.parentId !== eventId);
      }
      
      // Also remove all registrations for the deleted event(s)
      const eventIdsToRemove = isCompoundEvent 
          ? [eventId, ...data.events.filter(e => e.parentId === eventId).map(e => e._id)]
          : [eventId];
          
      const newAttendanceRecords = data.attendanceRecords.filter(a => !eventIdsToRemove.includes(a.eventId));
      
      updateData('events', newEvents);
      updateData('attendanceRecords', newAttendanceRecords);
      closeModal();
      showModal(`Successfully deleted ${eventToDelete.title} and ${eventIdsToRemove.length - 1} associated sub-events/registrations.`, 'sm');
  }, [data.events, data.attendanceRecords, updateData, closeModal, showModal]);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token'); // Clear simulated token
    updateState({
        isAuthenticated: false,
        currentUser: null,
        currentRole: 'Public',
        currentView: 'login',
    });
  }, [updateState]);
  
  // Initialize Auth from localStorage on mount
  useEffect(() => {
      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
          try {
              // Simulate JWT decoding
              const user = JSON.parse(atob(storedToken.split('.')[1]));
              
              updateState({
                  isAuthenticated: true,
                  currentUser: user,
                  currentRole: user.role,
                  currentView: user.role === 'Admin' ? 'dashboard' : 'availableEvents',
                  isAuthReady: true,
              });
          } catch (e) {
              logout();
              updateState({ isAuthReady: true });
          }
      } else {
          updateState({ isAuthReady: true });
      }
  }, [updateState, logout]);


  const contextValue = useMemo(() => ({
      state: { ...authState, ...data }, // Combine auth and data states
      updateState,
      updateData,
      updateAttendanceStatus, // Exposed attendance update function
      changeView,
      showModal,
      closeModal,
      logout,
      editEvent, // Exposed edit function
      deleteEvent, // Exposed delete function
  }), [authState, data, updateState, updateData, updateAttendanceStatus, changeView, showModal, closeModal, logout, editEvent, deleteEvent]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// --- GEMINI API UTILITY ---

const callGeminiApi = async (userQuery, systemPrompt = "") => {
    const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
    };

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "") {
        return { success: false, text: "Error: GEMINI_API_KEY is missing. Please provide your key." };
    }

    while (attempts < maxAttempts) {
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini returned no text.";
            
            return { success: true, text: text.trim() };

        } catch (error) {
            attempts++;
            console.error(`Gemini API attempt ${attempts} failed:`, error);
            if (attempts < maxAttempts) {
                // Exponential backoff: 1s, 2s, 4s delay
                const delay = Math.pow(2, attempts - 1) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    return { success: false, text: "Failed to connect to the AI service after multiple retries." };
};


// --- SECURITY UTILITY ---

const checkRole = (state, requiredRoles) => requiredRoles.includes(state.currentRole);

// --- AGENT HOOKS ---

const useAgents = () => {
  const { state, updateData } = React.useContext(AppContext);
  const { events, resources, currentUser, attendanceRecords, users, feedback } = state;

  // 1. Scheduling Agent: Conflict Detection & Suggestion
  const checkConflict = useCallback((newEvent) => {
    const newStart = new Date(newEvent.date + ' ' + newEvent.startTime).getTime();
    const newEnd = new Date(newEvent.date + ' ' + newEvent.endTime).getTime();
    const newVenueId = newEvent.venueId;
    const newCapacity = newEvent.expectedAttendance || 0;

    // Filter events based on type: only consider Approved Sub-Events and Standalone Events for conflict checking
    // Also ensure we don't conflict check against the event being edited (using _id)
    const eventsToCheck = events.filter(e => e.status === 'Approved' && !e.isParent && e._id !== newEvent._id);
    
    const conflicts = eventsToCheck.filter(e => {
      const existingStart = new Date(e.date + ' ' + e.startTime).getTime();
      const existingEnd = new Date(e.date + ' ' + e.endTime).getTime();
      const timeConflict = newStart < existingEnd && newEnd > existingStart;
      const venueConflict = e.venueId === newVenueId;
      return timeConflict && venueConflict;
    });

    if (conflicts.length > 0) {
      const venue = resources.find(r => r._id === newVenueId)?.name || 'Venue';
      const suggestions = [];
      const resourceList = resources.filter(r => r.capacity >= newCapacity && r._id !== newVenueId);
      
      if (resourceList.length > 0) {
        suggestions.push(`Try ${resourceList[0].name} (Cap ${resourceList[0].capacity}).`);
      }
      const latestEnd = Math.max(...conflicts.map(c => new Date(c.date + ' ' + c.endTime).getTime()));
      if (latestEnd) {
        const nextSlotTime = new Date(latestEnd + 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        suggestions.push(`Start at ${nextSlotTime} in ${venue}.`);
      }
      // Added clearer conflict message for coordinator
      const conflictingEventTitle = conflicts[0].title.replace(conflicts[0].parentId ? events.find(p => p._id === conflicts[0].parentId)?.title + ' - ' : '', '');
      return { conflict: true, suggestions, conflictingEvent: conflicts[0], message: `Venue/Time conflict with: ${conflictingEventTitle} on ${conflicts[0].date}.` };
    }

    const selectedResource = resources.find(r => r._id === newVenueId);
    if (selectedResource && selectedResource.capacity < newCapacity) {
      return { conflict: true, suggestions: [`Capacity conflict: ${selectedResource.name} only holds ${selectedResource.capacity}.`], message: `Capacity conflict: ${selectedResource.name} only holds ${selectedResource.capacity}.` };
    }

    return { conflict: false, suggestions: [], message: '✅ CONFLICT CHECK PASS: Schedule and capacity are clear. Good to go!' };
  }, [events, resources]);

  // 2. Engagement Agent: Personalization
  const getPersonalizedEvents = useCallback(() => {
    if (!currentUser) {
      // Return only Approved Compound and Approved Standalone Events
      return events.filter(e => e.status === 'Approved' && (e.isParent || !e.parentId))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    const { department = '', interests = [] } = currentUser;
    
    // Filter events to only show top-level items (Compound and Standalone events)
    let filteredEvents = events.filter(e => e.status === 'Approved' && (e.isParent || !e.parentId));

    filteredEvents.forEach(e => {
      e.priorityScore = 0;
      if (e.department === department) e.priorityScore += 10;
      if (e.tags && interests.some(i => e.tags.includes(i))) e.priorityScore += 5;
    });

    return filteredEvents.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return new Date(a.date) - new Date(b.date);
    });
  }, [events, currentUser]);
  
  // 3. Insight Agent: Analytics
  const getAnalyticsData = useCallback(() => {
    // Only count Sub-Events and Standalone events for attendance/resources
    const countableEvents = events.filter(e => e.status === 'Approved' && !e.isParent);
    
    const leaderboard = {};
    countableEvents.forEach(event => {
        const organizerDept = event.department || 'Other'; // Use event department (selected during creation)
        const attendees = attendanceRecords.filter(a => a.eventId === event._id && a.is_present).length; 
        leaderboard[organizerDept] = (leaderboard[organizerDept] || 0) + attendees;
    });

    const resourceUsage = {};
    countableEvents.forEach(event => {
        const venueName = resources.find(r => r._id === event.venueId)?.name || 'Unknown';
        resourceUsage[venueName] = (resourceUsage[venueName] || 0) + 1;
    });

    return { leaderboard, resourceUsage };
  }, [events, attendanceRecords, resources]);
  
  // Utility to update event status (simulating API call)
  const updateEventStatus = useCallback((eventId, newStatus) => {
      const newEvents = events.map(e => e._id === eventId ? { ...e, status: newStatus } : e);
      updateData('events', newEvents);
  }, [events, updateData]);


  return { checkConflict, getPersonalizedEvents, getAnalyticsData, updateEventStatus };
};

// --- GENERAL COMPONENTS ---

const Modal = () => {
  const { state, closeModal } = React.useContext(AppContext);
  const { modal } = state;

  if (!modal) return null;

  // Use 'lg' (max-w-4xl) for event details/participants, 'md' (max-w-xl) for registration form
  const sizeClass = modal.size === 'lg' ? 'max-w-4xl' : (modal.size === 'md' ? 'max-w-xl' : 'max-w-md');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto" // Added overflow-y-auto
      onClick={closeModal}
    >
      <div 
        className={`bg-white p-6 rounded-xl shadow-2xl w-full ${sizeClass} transform transition-all duration-300 scale-100 my-8`} // Added my-8 for vertical padding
        onClick={(e) => e.stopPropagation()}
      >
        {modal.content}
        {/* The generic close button is now removed here, as specific modals (like EventDetails) provide a better "Back" option. If a modal doesn't have a close button in its content, it will just use the backdrop click to close. */}
      </div>
    </div>
  );
};

const Header = () => {
    const { state, logout } = React.useContext(AppContext);
    const { currentRole, currentUser } = state;
    const displayName = currentUser?.displayName || (currentRole === 'Public' ? 'Guest' : 'Loading...');
    
    return (
        <header className={`shadow-xl text-white sticky top-0 z-10`} style={{ backgroundColor: COLORS.primary }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold flex items-center space-x-2">
                    <icons.Calendar className='w-7 h-7 text-white' style={{ color: COLORS.secondary }}/>
                    <span>{COLLEGE_NAME} <span className="font-medium text-xl opacity-80">EMS</span></span>
                </h1>
                
                {state.isAuthenticated ? (
                    <div className='flex items-center space-x-4'>
                         <div className="flex flex-col items-end">
                            <span className="font-semibold text-white/90">{displayName}</span>
                            <span className="text-xs text-white/70">{currentRole}</span>
                        </div>
                        <button onClick={logout} className='text-white hover:text-red-300 transition'>
                            <icons.LogOut className='w-6 h-6' />
                        </button>
                    </div>
                ) : (
                    <span className='text-white/80'>Please Log In</span>
                )}
            </div>
        </header>
    );
}

const Sidebar = () => {
    const { state, changeView, logout } = React.useContext(AppContext);
    const { currentRole, currentView, isAuthenticated } = state;

    const check = (roles) => checkRole(state, roles);
    
    const studentItems = [
        { view: 'availableEvents', label: 'Available Events', icon: icons.Home },
        { view: 'myApplications', label: 'My Applications', icon: icons.ListChecks },
    ];
    
    const coordinatorItems = [
        { view: 'dashboard', label: 'Dashboard', icon: icons.Home },
        { view: 'createEvent', label: 'Create Event', icon: icons.Plus },
        { view: 'myEvents', label: 'My Events', icon: icons.Calendar }, // Coordinator specific view
        { view: 'eventCheckIn', label: 'Event Check-In', icon: icons.ClipboardCheck }, // NEW
        
    ];
    
    const adminItems = [
        { view: 'dashboard', label: 'Dashboard', icon: icons.Home },
        { view: 'adminQueue', label: 'Approval Queue', icon: icons.CheckCircle },
        { view: 'adminAnalytics', label: 'Reports & Analytics', icon: icons.BarChart },
    ];

    let navItems = [];
    if (check(['Student'])) navItems = studentItems;
    else if (check(['Coordinator'])) navItems = coordinatorItems;
    else if (check(['Admin'])) navItems = adminItems;

    const NavItem = ({ view, label, icon: Icon }) => {
        const isActive = currentView === view;
        return (
            <button
                onClick={() => changeView(view)}
                className={`flex items-center space-x-3 p-3 text-sm font-semibold rounded-lg w-full transition duration-150 
                ${isActive ? 'bg-white text-navy shadow-md' : 'text-white hover:bg-white/20'}`}
                style={{ color: isActive ? COLORS.primary : 'white' }}
            >
                <Icon className='w-5 h-5' />
                <span>{label}</span>
            </button>
        );
    };

    if (!isAuthenticated || currentRole === 'Public') return null;

    return (
        <div className={`w-60 p-5 flex flex-col space-y-4 shadow-2xl`} style={{ backgroundColor: COLORS.primary }}>
            {navItems.map(item => <NavItem key={item.view} {...item} />)}
            
            <div className="flex-grow"></div>

            <button
                onClick={logout}
                className="flex items-center space-x-3 p-3 text-sm font-semibold rounded-lg w-full transition duration-150 text-white hover:bg-red-500/80"
            >
                <icons.LogOut className='w-5 h-5' />
                <span>Logout</span>
            </button>
        </div>
    );
};

// --- VIEWS ---

const UnauthorizedView = () => {
    const { state, changeView } = React.useContext(AppContext);
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white p-12 rounded-xl shadow-2xl w-full">
            <svg className="w-20 h-20 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
            <h2 className="text-3xl font-bold mt-6" style={{ color: COLORS.primary }}>Access Denied (RBAC Enforced)</h2>
            <p className="text-gray-600 mt-3 text-center">Your role ({state.currentRole}) does not have permission to view this resource.</p>
            <button onClick={() => changeView('dashboard')} className={`mt-8 bg-gold-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition shadow-lg`} style={{ backgroundColor: COLORS.secondary, color: COLORS.primary }}>
                Go to Dashboard
            </button>
        </div>
    );
};

const LoginScreen = () => {
    const { updateState, showModal } = React.useContext(AppContext);
    const [role, setRole] = useState('Student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    
    // FIX: mockUsers is now defined as an array
    const mockUsers = MOCK_DATA.users;
    
    // Helper function to get mock user profile based on role
    const getUserProfileByRole = (currentRole) => mockUsers.find(u => u.role === currentRole);


    useEffect(() => {
        // Pre-fill email based on role selection for convenience
        const userProfile = getUserProfileByRole(role);
        setEmail(userProfile ? userProfile.email : '');
    }, [role, mockUsers]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');

        // Find user by email (This is correct, as mockUsers is now an array)
        const userProfile = mockUsers.find(u => u.email === email); 
        
        // Check mock email/password match
        if (!userProfile || password !== userProfile.pass) {
            setMessage('Invalid Email or Password. Please check your credentials.');
            return;
        }
        
        // Check if the role selected matches the user profile found
        if (userProfile.role !== role) {
            setMessage(`Access denied. The credentials belong to a ${userProfile.role} account, not the selected ${role} role.`);
            return;
        }

        try {
            // Simulate JWT token creation and storage
            const tokenPayload = {
                _id: userProfile._id, 
                role: userProfile.role, 
                displayName: userProfile.displayName, 
                department: userProfile.department,
                email: userProfile.email
            };
            // Create a base64 encoded payload for JWT simulation
            const token = "header." + btoa(JSON.stringify(tokenPayload)) + ".signature";
            
            localStorage.setItem('jwt_token', token);
            
            updateState({
                currentUser: tokenPayload,
                currentRole: userProfile.role,
                isAuthenticated: true,
                currentView: userProfile.role === 'Admin' ? 'dashboard' : 'availableEvents'
            });

        } catch (error) {
            console.error('Login Failed:', error);
            setMessage('Login failed due to an unexpected system error.');
        }
    };
    
    // Use the helper function here
    const userProfile = getUserProfileByRole(role);
    const mockEmailHint = userProfile ? userProfile.email : 'user@sri-eshwar.edu';
    const mockPassHint = userProfile ? userProfile.pass : 'PasswordHint';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-t-8" style={{ borderTopColor: COLORS.primary }}>
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>{COLLEGE_NAME} Event Management</h2>
                    <p className="text-gray-500">Sign in to access your dashboard</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Role</label>
                        <select
                            value={role}
                            onChange={(e) => {setRole(e.target.value); setPassword('');}}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2"
                            style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                        >
                            <option value="Student">Student</option>
                            <option value="Coordinator">Event Coordinator</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email / Username</label>
                         <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={mockEmailHint}
                            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2"
                            style={{ borderColor: COLORS.primary }}
                        />
                         <p className="text-xs text-gray-500 mt-1">Mock Email: **{mockEmailHint}**</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder={`Enter password (e.g., ${mockPassHint})`}
                            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2"
                            style={{ borderColor: COLORS.primary }}
                        />
                         <p className="text-xs text-gray-500 mt-1">Mock Password: **{mockPassHint}**</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg text-white font-bold transition duration-200 shadow-lg"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        Login
                    </button>
                    {message && <p className={`text-center text-sm font-medium pt-2 text-red-500`}>{message}</p>}
                </form>
            </div>
        </div>
    );
};

// --- STUDENT VIEWS ---

const EventRegistrationModal = ({ event, onClose }) => {
    const { state, updateData, showModal, closeModal } = React.useContext(AppContext);
    const { attendanceRecords, currentUser } = state;
    
    // FIX: Member 1 fields (Leader) are initialized to EMPTY, NOT auto-filled.
    const initialTeamMembers = event.isTeamEvent ? Array.from({ length: event.maxTeamSize }, (_, i) => ({
        id: i,
        name: '', // Empty
        email: '', // Empty
        dept: '', // Empty
        year: '', // Empty
    })) : [];

    const [formData, setFormData] = useState({
        // Leader/Individual Details (start empty, user must enter details)
        regName: '',
        regDept: '',
        regYear: '', 
        regPhone: '', 
        regEmail: '', 
        // Team Details
        teamName: event.isTeamEvent ? '' : 'Individual',
        teamSize: event.isTeamEvent ? 1 : 1,
        teamMembers: initialTeamMembers, 
    });

    // Helper to keep team member 1 (Leader) synced with primary fields
    useEffect(() => {
         if (event.isTeamEvent) {
             setFormData(prev => {
                const newMembers = [...prev.teamMembers];
                if (newMembers[0]) {
                    newMembers[0] = {
                        ...newMembers[0],
                        name: prev.regName,
                        email: prev.regEmail,
                        dept: prev.regDept,
                        year: prev.regYear,
                    };
                }
                return { ...prev, teamMembers: newMembers };
            });
        }
    }, [formData.regName, formData.regEmail, formData.regDept, formData.regYear, event.isTeamEvent]);


    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    // Handler for the team size select field
    const handleTeamSizeChange = (e) => {
        const size = parseInt(e.target.value) || 1;
        
        let currentMembers = formData.teamMembers.slice(0, size);
        
        // Pad with EMPTY members if size increased
        while (currentMembers.length < size) {
            currentMembers.push({ id: currentMembers.length, name: '', email: '', dept: '', year: '' });
        }
        
        // Truncate members if size decreased
        currentMembers = currentMembers.slice(0, size);
        
        setFormData(prev => ({ 
            ...prev, 
            teamSize: size,
            teamMembers: currentMembers
        }));
    };
    
    // Handler for individual team member inputs
    const handleMemberChange = (index, field, value) => {
        const newMembers = formData.teamMembers.map((member, i) => {
            if (i === index) {
                return { ...member, [field]: value };
            }
            return member;
        });
        setFormData(prev => ({ ...prev, teamMembers: newMembers }));
    };

    const handleRegistrationSubmit = (e) => {
        e.preventDefault();
        
        const userId = currentUser?._id;
        const isRegistered = attendanceRecords.some(a => a.eventId === event._id && a.userId === userId);
        
        if (isRegistered) {
            showModal("You are already registered for this event.", 'sm');
            return;
        }

        const teamSize = event.isTeamEvent ? parseInt(formData.teamSize) : 1;
        
        // Basic validation for required fields (Leader details)
        if (!formData.regYear || !formData.regDept || !formData.regPhone || !formData.regName || !formData.regEmail) {
             showModal("Please complete all required fields for your individual/leader registration (Name, Email, Year, Department, Phone).", 'sm');
             return;
        }
        
        // Team member validation
        if (event.isTeamEvent) {
             if (!formData.teamName) {
                showModal("Please provide a Team Name.", 'sm');
                return;
            }
            
            // Final validation of all required members
            for (let i = 0; i < teamSize; i++) {
                const member = formData.teamMembers[i];
                // Check if the current member's details are complete
                if (!member || !member.name || !member.email || !member.dept || !member.year) {
                    showModal(`Please complete all required details (Name, Email, Dept, Year) for Team Member ${i + 1}.`, 'sm');
                    return;
                }
            }
        }


        try {
            const registrationRecord = {
                id: `a${Date.now()}`, 
                eventId: event._id,
                userId: userId,
                is_present: false, 
                timestamp: Date.now(),
                // Leader/Primary Registration Details
                regName: formData.regName,
                regDept: formData.regDept,
                regYear: formData.regYear,
                regPhone: formData.regPhone,
                regEmail: formData.regEmail,
                // Team Details (used for both individual and team)
                teamName: event.isTeamEvent ? formData.teamName : 'Individual',
                teamSize: teamSize,
                // Detailed member list (only for team events, leader is index 0)
                teamMembers: event.isTeamEvent ? formData.teamMembers.slice(0, teamSize) : [],
            };
            
            updateData('attendanceRecords', [...attendanceRecords, registrationRecord]);
            closeModal();
            showModal((
                <>
                    <h3 className="text-2xl font-bold" style={{ color: COLORS.success }}>Registration Successful!</h3>
                    <p className='mt-2'>Successfully registered for **{event.title}**.</p>
                </>
            ), 'sm');
            
        } catch (error) {
            showModal(`Registration failed: ${error.message}`, 'sm');
        }
    };

    return (
        <form onSubmit={handleRegistrationSubmit} className='space-y-4'>
            <h3 className="text-2xl font-bold border-b pb-2" style={{ color: COLORS.primary }}>Register for: {event.title}</h3>
            
            <p className='text-sm text-gray-600'>**Event Type:** {event.isTeamEvent ? `Team Event (Max: ${event.maxTeamSize} members)` : 'Individual Event'}</p>

            <h4 className="text-xl font-bold pt-4" style={{ color: COLORS.secondary }}>Your Details (Leader/Individual)</h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <InputField id="regName" label="Your Full Name" type="text" value={formData.regName} onChange={handleChange} required />
                <InputField id="regEmail" label="College Email" type="email" value={formData.regEmail} onChange={handleChange} required />
                <InputField id="regPhone" label="Contact Number" type="tel" value={formData.regPhone} onChange={handleChange} required />
            </div>
            
             <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                 <SelectField 
                    id="regYear" 
                    label="Your Year of Study" 
                    value={formData.regYear} 
                    onChange={handleChange} 
                    required 
                    options={YEAR_OPTIONS} 
                    color={COLORS.primary}
                />
                <SelectField 
                    id="regDept" 
                    label="Your Department" 
                    value={formData.regDept} 
                    onChange={handleChange} 
                    required 
                    options={DEPARTMENT_OPTIONS} 
                    color={COLORS.primary}
                />
            </div>


            {event.isTeamEvent && (
                <div className='pt-6 border-t border-gray-200 space-y-4'>
                    <h4 className="text-xl font-bold" style={{ color: COLORS.secondary }}>Team Information (Details of Members)</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <InputField id="teamName" label="Team Name" type="text" value={formData.teamName} onChange={handleChange} required />
                        <SelectField 
                            id="teamSize" 
                            label={`Total Team Members (Max ${event.maxTeamSize})`}
                            value={formData.teamSize} 
                            onChange={handleTeamSizeChange} 
                            required 
                            options={Array.from({ length: event.maxTeamSize }, (_, i) => ({ _id: i + 1, name: i + 1 }))}
                            color={COLORS.primary}
                        />
                    </div>
                    
                    {/* Dynamic Team Member Fields */}
                    {formData.teamMembers.slice(0, formData.teamSize).map((member, index) => (
                        <div key={index} className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <h5 className='font-semibold mb-3 flex items-center space-x-2' style={{ color: COLORS.primary }}>
                                <icons.UserPlus className='w-5 h-5'/>
                                <span>Member {index + 1} ({index === 0 ? 'Leader' : 'Peer'})</span>
                            </h5>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <InputField 
                                    id={`name-${index}`} 
                                    label="Name" 
                                    type="text" 
                                    value={member.name} 
                                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)} 
                                    required
                                />
                                <InputField 
                                    id={`email-${index}`} 
                                    label="Email" 
                                    type="email" 
                                    value={member.email} 
                                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)} 
                                    required
                                />
                                <SelectField 
                                    id={`year-${index}`} 
                                    label="Year" 
                                    value={member.year} 
                                    onChange={(e) => handleMemberChange(index, 'year', e.target.value)} 
                                    required 
                                    options={YEAR_OPTIONS} 
                                    color={COLORS.primary}
                                />
                                <SelectField 
                                    id={`dept-${index}`} 
                                    label="Department" 
                                    value={member.dept} 
                                    onChange={(e) => handleMemberChange(index, 'dept', e.target.value)} 
                                    required 
                                    options={DEPARTMENT_OPTIONS} 
                                    color={COLORS.primary}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <button
                type="submit"
                className="w-full py-3 rounded-lg text-white font-bold transition duration-200 shadow-lg mt-6"
                style={{ backgroundColor: COLORS.primary }}
            >
                Confirm Registration
            </button>
        </form>
    );
};

const SubEventCard = ({ event, parentTitle, onRegisterClick, isRegistered, participants, totalEvents }) => {
     const venue = MOCK_DATA.resources.find(r => r._id === event.venueId)?.name || 'Venue Not Set';

     return (
         <div className={`bg-gray-50 p-4 rounded-lg shadow-inner border-l-4 ${isRegistered ? 'border-green-500' : 'border-gray-300'}`}>
             <div className='flex justify-between items-start'>
                 <div>
                     <h5 className="text-lg font-bold" style={{ color: COLORS.primary }}>{event.title.replace(`${parentTitle} - `, '')}</h5>
                     <p className="text-sm text-gray-600 font-semibold">{event.category} | Dept: {event.department}</p>
                 </div>
                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${event.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-600'}`}>
                    {event.isTeamEvent ? `Team (Max ${event.maxTeamSize})` : 'Individual'}
                 </span>
             </div>
             <div className="text-sm mt-3 space-y-1">
                 <p className='text-gray-700'>**Time:** {event.startTime} - {event.endTime} on {event.date}</p>
                 <p className='text-gray-700'>**Venue:** {venue}</p>
                 <p className='text-gray-700'>**Coordinator:** {event.coordName}</p>
                 <p className='text-gray-700'>**Registrants:** {participants} / {event.expectedAttendance}</p>
             </div>

             <div className='mt-4 flex justify-end'>
                 <button
                    onClick={() => onRegisterClick(event)}
                    className="px-4 py-2 rounded-lg text-white font-bold text-sm transition shadow-md"
                    style={{ backgroundColor: isRegistered ? COLORS.success : COLORS.primary }}
                >
                    {isRegistered ? 'Registered (View Details)' : 'Register for Sub-Event'}
                 </button>
             </div>
         </div>
     );
}


const EventDetailsModal = ({ event, onClose }) => {
    const { state, showModal, closeModal } = React.useContext(AppContext);
    const { resources, attendanceRecords, currentUser, events } = state;

    const venue = resources.find(r => r._id === event.venueId)?.name || 'Venue Not Set';
    
    // Check if the current event is a Compound Event
    const isCompoundEvent = event.isParent && event.category === 'Compound';
    const subEvents = isCompoundEvent 
        ? events.filter(e => e.parentId === event._id)
            .sort((a, b) => new Date(a.date + ' ' + a.startTime) - new Date(b.date + ' ' + b.startTime)) 
        : [];

    // Registration logic is only relevant for non-Compound events (Standalone/Sub-Events)
    const isRegistered = !isCompoundEvent && attendanceRecords.some(a => a.eventId === event._id && a.userId === currentUser?._id);
    const registration = !isCompoundEvent ? attendanceRecords.find(a => a.eventId === event._id && a.userId === currentUser?._id) : null;
    
    // Find coordinator details from event mock data
    const coordinatorDetails = {
        name: event.coordName,
        phone: event.coordPhone,
        dept: event.department
    };
    
    // Co-coordinator details
    const coCoordinators = event.coCoordinators || [];

    const handleRegisterClick = (subEvent = event) => {
        closeModal(); // Close details modal first
        showModal(<EventRegistrationModal event={subEvent} onClose={onClose} />, 'md');
    };
    
    const handleQRCodeDisplay = () => {
        closeModal();
        const qrUrl = QR_CODE_API(`EMS_CHECKIN|${event._id}|${currentUser._id}|${Date.now()}`);
         const qrContent = (
             <>
                 <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.primary }}>Registration QR Code</h3>
                 <p className="text-lg text-gray-700 mb-4">{event.title}</p>
                 <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                     <img src={qrUrl} alt="QR Code" className={`w-48 h-48 border-4 rounded-lg`} style={{ borderColor: COLORS.secondary }}/>
                     <p className="text-xs text-gray-500 mt-3">Ready for check-in!</p>
                 </div>
             </>
         );
         showModal(qrContent, 'md');
    };
    
    // Determine the source for the event poster
    const posterSrc = event.posterUrl || EVENT_POSTER_PLACEHOLDER(event.category);

    return (
        <div className='space-y-4'>
            {/* Added back button */}
            <button 
                onClick={onClose} // Use onClose passed from Modal (which calls closeModal)
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-semibold transition p-1 rounded-lg"
            >
                <icons.ArrowLeft className='w-5 h-5'/>
                <span>Back to Events</span>
            </button>

            <h3 className="text-3xl font-extrabold" style={{ color: COLORS.primary }}>{event.title}</h3>
            <p className="text-sm font-semibold opacity-75" style={{ color: COLORS.primary }}>
                {isCompoundEvent ? 'COMPOUND EVENT (Combined Event)' : `${event.category} Event`} | Hosted by: {event.department}
            </p>
            
            <img 
                src={posterSrc} 
                alt="Event Poster" 
                className="w-full h-auto rounded-lg shadow-md object-cover"
                style={{height: '200px'}}
                onError={(e) => { // Fallback in case the URL fails
                    e.target.onerror = null; 
                    e.target.src = EVENT_POSTER_PLACEHOLDER(event.category);
                }}
            />
            
            {event.websiteUrl && (
                <a href={event.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                    <icons.Link className='w-4 h-4'/>
                    <span>Visit Event Website</span>
                </a>
            )}


            {/* Details Grid (Only display scheduling info for Standalone/Parent Events) */}
            <div className='grid grid-cols-2 gap-4 text-gray-700 p-3 rounded-lg border border-dashed' style={{borderColor: COLORS.secondary}}>
                {/* FIX: Removed Venue/Time for Compound Events that don't need it */}
                {isCompoundEvent ? (
                    <p className='col-span-2'><span className="font-semibold">Event Dates:</span> See Sub-Events below for specific timings.</p>
                ) : (
                    <>
                        <p><span className="font-semibold">Date/Time:</span> {event.date} @ {event.startTime} - {event.endTime}</p>
                        <p><span className="font-semibold">Venue:</span> {venue}</p>
                        <p><span className="font-semibold">Type:</span> {event.isTeamEvent ? `Team (Max ${event.maxTeamSize})` : 'Individual'}</p>
                    </>
                )}
                <p><span className="font-semibold">Department:</span> {event.department}</p>
            </div>
            
            <div className='p-3 rounded-lg border' style={{borderColor: COLORS.primary}}>
                <h4 className='font-bold text-lg' style={{ color: COLORS.primary }}>Coordinator Details</h4>
                <p className='text-sm flex items-center space-x-2'><icons.Users className='w-4 h-4'/> 
                    <span>**Main Coordinator:** {coordinatorDetails.name} (Dept: {coordinatorDetails.dept})</span>
                </p>
                <p className='text-sm flex items-center space-x-2'><icons.Phone className='w-4 h-4'/> <span>Contact: {coordinatorDetails.phone}</span></p>
                
                {coCoordinators.length > 0 && (
                    <div className='mt-2 pt-2 border-t border-gray-100'>
                        <h5 className='text-sm font-semibold text-gray-600'>Co-Coordinators:</h5>
                        {coCoordinators.map((co, index) => (
                            <p key={index} className='text-xs ml-4 flex items-center space-x-2'>
                                <icons.UserPlus className='w-3 h-3 text-gray-500'/>
                                <span>{co.name} (Dept: {co.department || 'N/A'}) - {co.phone}</span>
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {isRegistered && registration && (
                 <div className='p-3 rounded-lg border-2 border-green-500 bg-green-50'>
                    <h4 className='font-bold text-lg text-green-700'>Your Registration Details (Confirmed)</h4>
                    {registration.is_present && <p className='text-sm font-bold text-green-700'>**Attendance Status:** CHECKED IN / PRESENT</p>}
                    {event.isTeamEvent && (
                        <p className='text-sm'>**Team:** {registration.teamName} | **Size:** {registration.teamSize} members</p>
                    )}
                    <p className='text-sm'>**Lead:** {registration.regName} ({registration.regYear}, {registration.regDept})</p>
                    <p className='text-sm'>**Contact:** {registration.regPhone} / {registration.regEmail}</p>
                </div>
            )}
            
            {/* Display Sub-Events if this is a Compound Event */}
            {isCompoundEvent && subEvents.length > 0 && (
                <div className='pt-4'>
                    <h4 className="text-xl font-bold mb-3 flex items-center space-x-2" style={{ color: COLORS.primary }}>
                        <icons.Layers className='w-5 h-5'/>
                        <span>Sub-Events within this Compound Event ({subEvents.length})</span>
                    </h4>
                    <div className='space-y-4'>
                        {subEvents.map(sub => {
                            const subIsRegistered = attendanceRecords.some(a => a.eventId === sub._id && a.userId === currentUser?._id);
                            const subParticipants = attendanceRecords.filter(a => a.eventId === sub._id).length;
                            return (
                                <SubEventCard 
                                    key={sub._id} 
                                    event={sub} 
                                    parentTitle={event.title} 
                                    onRegisterClick={handleRegisterClick} 
                                    isRegistered={subIsRegistered}
                                    participants={subParticipants}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="pt-2">
                <p className="font-semibold" style={{ color: COLORS.primary }}>Description (AI Enhanced):</p>
                <p className="text-gray-800 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Registration/QR code button only appears for Standalone or Sub-Events */}
            {!isCompoundEvent && (
                <div className="pt-4 flex justify-end">
                    {isRegistered ? (
                        <button
                            onClick={handleQRCodeDisplay}
                            className="px-6 py-3 rounded-lg text-white font-bold transition shadow-lg"
                            style={{ backgroundColor: COLORS.success }}
                        >
                            View QR Code
                        </button>
                    ) : (
                        <button
                            onClick={() => handleRegisterClick(event)}
                            className="px-6 py-3 rounded-lg text-white font-bold transition shadow-lg"
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            Register Now
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const EventCard = ({ event, isEligible, onApply }) => {
    const { state, showModal, closeModal } = React.useContext(AppContext);
    const { resources, attendanceRecords, currentUser, events } = state;
    
    const userId = currentUser?._id;

    // FIX: Correctly identify Compound/Sub-Events
    const isCompoundEvent = event.isParent && event.category === 'Compound';
    const subEventCount = isCompoundEvent ? events.filter(e => e.parentId === event._id).length : 0;
    
    // FIX: Clean up display placeholders
    const venue = resources.find(r => r._id === event.venueId)?.name;
    const participants = attendanceRecords.filter(a => a.eventId === event._id).length;
    
    // Registration check only relevant for non-Compound events
    const isRegistered = !isCompoundEvent && attendanceRecords.some(a => a.eventId === event._id && a.userId === userId);

    const statusClass = event.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-600';
    const statusText = event.status || 'Pending';
    
    const handleViewDetails = () => {
        showModal(<EventDetailsModal event={event} onClose={closeModal} />, 'lg');
    };

    return (
        <div className={`bg-white p-5 rounded-xl shadow-lg border-l-4 transition duration-300 ${isRegistered ? 'border-l-4 border-r-4 border-green-500' : 'border-gray-200 hover:shadow-xl'}`}>
            <div className='flex justify-between items-start'>
                <h4 className="text-xl font-bold" style={{ color: COLORS.primary }}>{event.title}</h4>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${statusClass}`}>
                    {isCompoundEvent ? 'COMPOUND' : statusText}
                </span>
            </div>
            
            <p className="text-sm font-semibold mt-2 opacity-75" style={{ color: COLORS.primary }}>{event.category} {isCompoundEvent ? 'Event' : ''}</p>
            
            <div className="mt-4 text-sm space-y-1">
                {/* FIX: Remove Venue/Registrants for Compound Events */}
                {!isCompoundEvent && venue && (
                    <p className='flex items-center space-x-2 text-gray-700'>
                        <icons.Home className='w-4 h-4 text-gray-500' />
                        <span>{venue}</span>
                    </p>
                )}
                <p className='flex items-center space-x-2 text-gray-700'>
                    <icons.Calendar className='w-4 h-4 text-gray-500' />
                    <span>{event.date} @ {event.startTime}</span>
                </p>
                
                {isCompoundEvent ? (
                     <p className='flex items-center space-x-2 font-bold' style={{color: COLORS.primary}}>
                        <icons.Layers className='w-4 h-4'/>
                        <span>{subEventCount} Sub-Events</span>
                    </p>
                ) : (
                    <p className='flex items-center space-x-2 text-gray-700'>
                        <icons.Users className='w-4 h-4 text-gray-500' />
                        {/* FIX: Remove 0/0 Registrants placeholder if data is zero/missing */}
                        {(participants > 0 || event.expectedAttendance > 0) ? (
                            <span>{participants} / {event.expectedAttendance} registrants</span>
                        ) : (
                            <span>No registrations yet</span>
                        )}
                    </p>
                )}
            </div>
            
            <div className="mt-5 flex justify-between items-center space-x-3">
                <button
                    onClick={handleViewDetails}
                    className="px-3 py-2 rounded-lg text-white font-semibold text-sm transition shadow-md flex-1"
                    style={{ backgroundColor: COLORS.primary }}
                >
                    View Details
                </button>
                {/* For Compound, the button is just 'View Details'. For Standalone/Sub-Events, it's Register/Registered */}
                {!isCompoundEvent && (
                    <button 
                        onClick={() => onApply(event._id, event.title)}
                        disabled={!isEligible && !isRegistered}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition shadow-md flex-1`}
                        style={{ 
                            backgroundColor: isRegistered ? COLORS.success : (isEligible ? COLORS.secondary : COLORS.danger),
                            color: isRegistered ? 'white' : (isEligible ? COLORS.primary : 'white')
                        }}
                    >
                        {isRegistered ? 'Registered' : (isEligible ? 'Register' : 'Ineligible')}
                    </button>
                )}
            </div>
        </div>
    );
};

const AvailableEvents = () => {
    const { state, showModal, closeModal } = React.useContext(AppContext);
    const { events, attendanceRecords, currentUser } = state;
    const { getPersonalizedEvents } = useAgents();

    const [filterCategory, setFilterCategory] = useState('All');

    const userId = currentUser?._id;

    // 1. Filter events using Engagement Agent
    // Get only Compound Events and Standalone Events (Top-Level only)
    let personalizedEvents = getPersonalizedEvents(); 

    if (filterCategory !== 'All') {
        personalizedEvents = personalizedEvents.filter(e => e.category === filterCategory);
    }

    // 2. Mock Eligibility Check 
    const checkEligibility = (event) => {
        if (!currentUser) return false;
        return event.status === 'Approved';
    };
    
    const handleApply = (eventId, title) => {
         const eventToRegister = events.find(e => e._id === eventId);
         
         if (!eventToRegister) return;
         
         // If it's a Compound Event, open details (where sub-events are listed)
         const isCompoundEvent = eventToRegister.isParent && eventToRegister.category === 'Compound';
         if (isCompoundEvent) {
            showModal(<EventDetailsModal event={eventToRegister} onClose={closeModal} />, 'lg');
            return;
         }

         // If it's a standalone event/sub-event, check registration and open form/details
         const isRegistered = attendanceRecords.some(a => a.eventId === eventId && a.userId === userId);

         if (isRegistered) {
             showModal(<EventDetailsModal event={eventToRegister} onClose={closeModal} />, 'lg');
             return;
         }

         showModal(<EventRegistrationModal event={eventToRegister} onClose={closeModal} />, 'md');
    };


    // Stats now only count Standalone and Sub-Events (non-Parent)
    const nonParentEvents = events.filter(e => !e.isParent);
    const stats = {
        available: personalizedEvents.length,
        // Count registrations only for non-parent events
        applied: attendanceRecords.filter(a => a.userId === userId && nonParentEvents.some(e => e._id === a.eventId)).length,
        attended: attendanceRecords.filter(a => a.userId === userId && a.is_present && nonParentEvents.some(e => e._id === a.eventId)).length,
    };

    return (
        <>
            <h2 className="text-3xl font-bold mb-8" style={{ color: COLORS.primary }}>Available Events</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Combined/Standalone" value={stats.available} color={COLORS.primary} icon={icons.Calendar} />
                <StatCard title="My Sub-Event Applications" value={stats.applied} color={COLORS.secondary} icon={icons.ListChecks} />
                <StatCard title="Sub-Events Attended" value={stats.attended} color={COLORS.success} icon={icons.CheckCircle} />
            </div>

            <div className='flex justify-between items-center mb-5'>
                <h3 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Browse Combined & Standalone Events</h3>
                <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`p-2 rounded-lg border shadow-sm text-sm font-semibold`}
                    style={{borderColor: COLORS.primary, color: COLORS.primary}}
                >
                    <option value="All">All Categories</option>
                    <option value="Compound">Compound Event</option>
                    <option value="Technical">Technical</option>
                    <option value="Non-Technical">Non-Technical</option>
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {personalizedEvents.map(event => (
                    <EventCard 
                        key={event._id} 
                        event={event} 
                        isEligible={checkEligibility(event)} 
                        onApply={handleApply}
                    />
                ))}
            </div>
        </>
    );
};

const MyApplications = () => {
    const { state, updateAttendanceStatus, showModal } = React.useContext(AppContext);
    const { attendanceRecords, events, currentUser } = state;
    const userId = currentUser?._id;


    const myApplications = attendanceRecords
        .filter(a => a.userId === userId)
        .map(app => {
            const event = events.find(e => e._id === app.eventId);
            return {
                ...app,
                eventTitle: event?.title || 'Unknown Event',
                eventDate: event?.date || 'N/A',
                eventStatus: event?.status || 'N/A',
                isTeamEvent: event?.isTeamEvent || false,
                teamName: app.teamName || 'Individual',
                teamSize: app.teamSize || 1,
            };
        });

    const handleConfirmAttended = (app) => {
        const eventDate = new Date(app.eventDate);
        const today = new Date();
        
        // Prevent self-marking if event hasn't happened yet
        if (eventDate.getTime() > today.getTime()) {
             showModal("The event has not yet occurred. You can only confirm attendance after the event date has passed.", 'sm');
             return;
        }

        // Update status via context
        updateAttendanceStatus(app.id, true);
         showModal(`Attendance confirmed for ${app.eventTitle}!`, 'sm');
    };


    return (
        <>
            <h2 className="text-3xl font-bold mb-8" style={{ color: COLORS.primary }}>My Applications</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {myApplications.map((app) => {
                            const isEventPassed = new Date(app.eventDate).getTime() < new Date().getTime();
                            
                            return (
                                <tr key={app.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.eventTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.eventDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {app.isTeamEvent ? `${app.teamName} (Size: ${app.teamSize})` : 'Individual'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                                            ${app.eventStatus === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {app.eventStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* FIX: Removed student's self-confirm button, now only displays status */}
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                                            ${app.is_present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {app.is_present ? 'Present (Checked In)' : 'Not Checked In'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {myApplications.length === 0 && <p className="p-4 text-center text-gray-500">You have no event applications.</p>}
            </div>
        </>
    );
};

// --- COORDINATOR/ADMIN VIEWS (SHARED) ---

const DashboardOverview = () => {
    const { state } = React.useContext(AppContext);
    const { events, attendanceRecords } = state;
    
    // Only count Standalone and Parent events for these metrics
    const topLevelEvents = events.filter(e => !e.parentId); 

    const totalEvents = topLevelEvents.length;
    const approvedEvents = topLevelEvents.filter(e => e.status === 'Approved').length;
    const ongoingEvents = topLevelEvents.filter(e => e.status === 'Approved' && new Date(e.date) >= new Date()).length;
    
    // Count all non-parent registrations
    const nonParentEventIds = events.filter(e => !e.isParent).map(e => e._id);
    const totalParticipants = attendanceRecords.filter(a => nonParentEventIds.includes(a.eventId)).length;

    return (
        <>
            <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Dashboard Overview</h2>
            <p className='text-gray-600 mb-8'>Welcome back! Here's what the Insight Agent is tracking today.</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Combined/Standalone" value={totalEvents} color={COLORS.primary} icon={icons.Calendar} />
                <StatCard title="Approved Top-Level" value={approvedEvents} color={COLORS.success} icon={icons.CheckCircle} />
                <StatCard title="Upcoming Top-Level" value={ongoingEvents} color={COLORS.secondary} icon={icons.Calendar} />
                <StatCard title="Total Sub-Event Registrations" value={totalParticipants} color={COLORS.primary} icon={icons.Users} />
            </div>

            {/* Insight Agent Visualization Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4" style={{ borderTopColor: COLORS.primary }}>
                    <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.primary }}>Department-wise Participation (Mock)</h3>
                    {/* Placeholder for Pie Chart (use image or simple list for hackathon) */}
                    <div className="h-64 flex items-center justify-center border border-dashed p-4 rounded-lg bg-gray-50">
                        <icons.BarChart className='w-8 h-8 text-gray-400 mb-2'/>
                        <p className="text-gray-500">Visualization Placeholder - Department Leaderboard</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4" style={{ borderTopColor: COLORS.secondary }}>
                    <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.primary }}>Recent Event Requests</h3>
                    <RecentRequestsList />
                </div>
            </div>
        </>
    );
};

const RecentRequestsList = () => {
    const { state } = React.useContext(AppContext);
    // Sort by creation date (mocked) to show newest first
    const recentEvents = [...state.events].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5); 

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {recentEvents.map((event) => (
                        <tr key={event._id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {event.isParent && <icons.Layers className='w-4 h-4 inline-block mr-2' style={{color: COLORS.secondary}}/>}
                                {event.title}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {event.isParent ? 'Compound' : (event.parentId ? 'Sub-Event' : 'Standalone')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{event.date}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <StatusPill status={event.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border-l-4" style={{ borderColor: color }}>
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <Icon className='w-6 h-6' style={{ color: color }} />
        </div>
        <p className="text-3xl font-extrabold mt-1" style={{ color: COLORS.primary }}>{value}</p>
        <p className="text-xs text-gray-400 mt-2">Data tracked by Insight Agent</p>
    </div>
);

const StatusPill = ({ status }) => {
    let colorClass, text;
    switch (status) {
        case 'Approved':
            colorClass = 'bg-green-100 text-green-800';
            text = 'Approved';
            break;
        case 'Pending':
            colorClass = 'bg-yellow-100 text-yellow-800';
            text = 'Pending';
            break;
        case 'Rejected':
            colorClass = 'bg-red-100 text-red-800';
            text = 'Rejected';
            break;
        default:
            colorClass = 'bg-gray-100 text-gray-800';
            text = 'Draft';
    }
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
            {text}
        </span>
    );
};

// --- EVENT FORM (COORDINATOR/ADMIN) ---

// Helper component for adding co-coordinators
const CoCoordinatorInput = ({ index, value, onChange, departmentOptions, color }) => {
    const handleChange = (e) => {
        const { name, value: val } = e.target;
        onChange(index, name, val);
    };

    return (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField 
                id={`coName-${index}`} 
                label={`Co-Coordinator ${index + 1} Name`} 
                type="text" 
                value={value.name} 
                onChange={handleChange} 
                name="name"
                required
            />
             <InputField 
                id={`coPhone-${index}`} 
                label={`Co-Coordinator ${index + 1} Phone`} 
                type="tel" 
                value={value.phone} 
                onChange={handleChange} 
                name="phone"
                required
            />
            <SelectField
                id={`coDept-${index}`}
                label={`Co-Coordinator ${index + 1} Department`}
                value={value.department}
                onChange={(e) => onChange(index, 'department', e.target.value)}
                required
                options={departmentOptions}
                color={color}
            />
        </div>
    );
}

// Helper component for creating sub-events within a Compound Event
const SubEventInput = ({ index, subEvent, onChange, resources, events, subEventId }) => {
    const { checkConflict } = useAgents();
    
    // --- REAL-TIME SUB-EVENT CONFLICT CHECK ---
    const conflictResult = useMemo(() => {
        // Only run conflict check if minimum required fields are filled
        if (subEvent.date && subEvent.startTime && subEvent.endTime && subEvent.venueId && subEvent.expectedAttendance) {
            return checkConflict({
                ...subEvent,
                expectedAttendance: parseInt(subEvent.expectedAttendance),
                _id: subEventId // Pass the subEvent's ID to exclude itself from conflict checks when editing
            });
        }
        return { conflict: false, message: "Enter details to check resource conflicts." };
    }, [subEvent.date, subEvent.startTime, subEvent.endTime, subEvent.venueId, subEvent.expectedAttendance, checkConflict, subEventId]);
    
    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        onChange(index, id, type === 'checkbox' ? checked : value);
    };

    // Sub-event co-coordinator handler (Max 2 Co-Coordinators for Sub-Events)
    const handleSubCoordChange = (coordIndex, field, value) => {
        const newCoordinators = subEvent.coCoordinators.map((coord, i) => 
            i === coordIndex ? { ...coord, [field]: value } : coord
        );
        onChange(index, 'coCoordinators', newCoordinators);
    };

    const handleSubNumCoordinatorsChange = (e) => {
        const num = parseInt(e.target.value) || 0;
        onChange(index, 'numCoCoordinators', num);
    };


    return (
        <div className="p-6 rounded-xl shadow-inner border-t-4 mb-6" style={{borderTopColor: COLORS.secondary}}>
            <h4 className="text-lg font-bold mb-4" style={{ color: COLORS.secondary }}>Sub-Event {index + 1} Details</h4>
            
            {/* Conflict Status Display */}
            <div className={`p-3 rounded-lg text-sm font-medium mb-4 border-2`} 
                 style={{ borderColor: conflictResult.conflict ? COLORS.danger : COLORS.success, 
                          color: conflictResult.conflict ? COLORS.danger : COLORS.primary,
                          backgroundColor: conflictResult.conflict ? COLORS.danger + '10' : COLORS.success + '10'
                        }}>
                {conflictResult.conflict ? `🚨 CONFLICT: ${conflictResult.message}` : conflictResult.message}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InputField id="title" label="Sub-Event Title" type="text" value={subEvent.title} onChange={handleChange} required />
                <SelectField 
                    id="category" 
                    label="Event Category" 
                    value={subEvent.category} 
                    onChange={handleChange} 
                    required 
                    options={[{_id:'Technical', name: 'Technical'}, {_id:'Non-Technical', name: 'Non-Technical'}]}
                    color={COLORS.primary}
                />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InputField id="coordName" label="Main Coordinator Name" type="text" value={subEvent.coordName} onChange={handleChange} required />
                <InputField id="coordPhone" label="Coordinator Phone" type="tel" value={subEvent.coordPhone} onChange={handleChange} required />
            </div>
            
            <TextAreaField id="description" label="Sub-Event Description" value={subEvent.description} onChange={handleChange} required />


            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <InputField id="date" label="Date" type="date" value={subEvent.date} onChange={handleChange} required />
                <InputField id="startTime" label="Start Time" type="time" value={subEvent.startTime} onChange={handleChange} required />
                <InputField id="endTime" label="End Time" type="time" value={subEvent.endTime} onChange={handleChange} required />
                <InputField id="expectedAttendance" label="Expected Attendance" type="number" placeholder="e.g., 50" value={subEvent.expectedAttendance} onChange={handleChange} required />
                <SelectField id="venueId" label="Venue / Hall" value={subEvent.venueId} onChange={handleChange} required options={resources} color={COLORS.primary} />
                <SelectField 
                    id="department" 
                    label="Coordinating Department" 
                    value={subEvent.department} 
                    onChange={handleChange} 
                    required 
                    options={DEPARTMENT_OPTIONS}
                    color={COLORS.primary}
                />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                 <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg border">
                    <input type="checkbox" id="isTeamEvent" checked={subEvent.isTeamEvent} onChange={handleChange} className={`rounded`} style={{ color: COLORS.primary }}/>
                    <label htmlFor="isTeamEvent" className="text-gray-700 font-semibold">Is this a Team Registration Event?</label>
                </div>
                
                {subEvent.isTeamEvent && (
                    <InputField 
                        id="maxTeamSize" 
                        label="Maximum Team Size (2-10)" 
                        type="number" 
                        value={subEvent.maxTeamSize} 
                        onChange={handleChange} 
                        required 
                        min="2"
                        max="10"
                    />
                )}
            </div>
            
            {/* Sub-Event Co-Coordinators (Max 2) */}
            <h5 className="text-md font-bold pt-4 mt-4" style={{ color: COLORS.primary }}>Sub-Event Co-Coordinators (Max 2)</h5>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <SelectField 
                    id="numCoCoordinators" 
                    label="Number of Co-Coordinators" 
                    value={subEvent.numCoCoordinators} 
                    onChange={handleSubNumCoordinatorsChange} 
                    required 
                    options={Array.from({ length: 3 }, (_, i) => ({_id: i, name: i === 0 ? 'None' : i}))}
                    color={COLORS.primary}
                />
            </div>
            <div className='space-y-3 mt-3'>
                {subEvent.coCoordinators.slice(0, subEvent.numCoCoordinators).map((coord, coordIndex) => (
                    <CoCoordinatorInput 
                        key={coordIndex} 
                        index={coordIndex} 
                        value={coord}
                        onChange={handleSubCoordChange}
                        departmentOptions={DEPARTMENT_OPTIONS}
                        color={COLORS.primary}
                    />
                ))}
            </div>
        </div>
    );
};


const CreateEventForm = ({ eventToEdit, isEditing = false }) => {
    const { state, changeView, showModal, updateData, editEvent } = React.useContext(AppContext);
    const { resources, currentRole, currentUser, events } = state;
    const { checkConflict } = useAgents();
    
    // State to determine if we are creating a Standalone or Compound Event
    const [creationType, setCreationType] = useState(isEditing ? (eventToEdit.isParent ? 'compound' : 'standalone') : 'standalone'); // 'standalone', 'compound'
    
    // Initial state setup (Max 10 Co-Coordinators for Parent Event)
    const initialMainCoordinators = Array.from({ length: 10 }, () => ({ name: '', phone: '', department: '' }));
    // Initial state for Sub-Event Co-Coordinators (Max 2)
    const initialSubCoordinators = Array.from({ length: 2 }, () => ({ name: '', phone: '', department: '' }));
    
    const getInitialSubEvent = () => ({
        _id: `temp-${Date.now() + Math.random()}`, // Use a temporary ID for new subs
        title: '', description: '', date: '', startTime: '', endTime: '', venueId: '', 
        expectedAttendance: 50, category: 'Technical', coordName: '', coordPhone: '', 
        department: '', isTeamEvent: false, maxTeamSize: 1,
        coCoordinators: initialSubCoordinators.map(c => ({...c})), // Deep clone for sub-events
        numCoCoordinators: 0, 
    });
    
    // Function to load existing data for editing
    const loadEventData = useCallback((event) => {
        if (!event) return;
        
        // Load main event details
        let baseData = {
            _id: event._id,
            title: event.title, description: event.description, date: event.date, startTime: event.startTime, endTime: event.endTime,
            venueId: event.venueId, expectedAttendance: event.expectedAttendance, category: event.category, 
            coordName: event.coordName, coordPhone: event.coordPhone, coordEmail: event.coordEmail || currentUser?.email, isExternal: event.isExternal,
            department: event.department, isTeamEvent: event.isTeamEvent, maxTeamSize: event.maxTeamSize, 
            posterUrl: event.posterUrl, websiteUrl: event.websiteUrl,
            
            // Populate main coordinators
            coCoordinators: initialMainCoordinators.map((def, i) => event.coCoordinators?.[i] || def),
            numCoCoordinators: event.coCoordinators?.length || 0,
            isParent: event.isParent,
            
            // Default sub-event state if it's standalone
            numSubEvents: 0,
            subEvents: [getInitialSubEvent()],
        };

        if (event.isParent) {
            const currentSubEvents = events.filter(e => e.parentId === event._id).map(sub => {
                // Ensure sub-event co-coordinator structure is loaded correctly
                const subCoordinators = initialSubCoordinators.map((def, i) => sub.coCoordinators?.[i] || def);
                return {
                    ...getInitialSubEvent(),
                    ...sub,
                    title: sub.title.replace(`${event.title} - `, ''), // Remove parent prefix for editing
                    coCoordinators: subCoordinators,
                    numCoCoordinators: sub.coCoordinators?.length || 0,
                    _id: sub._id 
                };
            });

            baseData = {
                ...baseData,
                numSubEvents: currentSubEvents.length,
                subEvents: currentSubEvents.length > 0 ? currentSubEvents : [getInitialSubEvent()],
            };
        }
        return baseData;

    }, [currentUser?.email, events, initialMainCoordinators, initialSubCoordinators]);
    
    const [formData, setFormData] = useState(isEditing ? loadEventData(eventToEdit) : {
        title: '', description: '', date: '', startTime: '', endTime: '',
        venueId: '', expectedAttendance: '', category: 'Technical', coordName: currentUser?.displayName || '', coordPhone: '', coordEmail: currentUser?.email || '', isExternal: false,
        department: '', isTeamEvent: false, maxTeamSize: 1, posterUrl: '', websiteUrl: '',
        coCoordinators: initialMainCoordinators, numCoCoordinators: 0,
        isParent: false, numSubEvents: 1, subEvents: [getInitialSubEvent()],
    });
    
    // --- REAL-TIME STANDALONE CONFLICT CHECK ---
    const conflictResult = useMemo(() => {
        // Only check conflicts for Standalone events
        if (creationType === 'standalone' && formData.date && formData.startTime && formData.endTime && formData.venueId && formData.expectedAttendance) {
            return checkConflict({
                ...formData,
                expectedAttendance: parseInt(formData.expectedAttendance),
                _id: formData._id // Pass event ID if editing to exclude self
            });
        }
        return { conflict: false, message: 'Enter event details to check for conflicts.' };
    }, [formData.date, formData.startTime, formData.endTime, formData.venueId, formData.expectedAttendance, checkConflict, creationType, formData._id]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!checkRole(state, ['Coordinator', 'Admin'])) return <UnauthorizedView />;

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        
        let newValue = type === 'checkbox' ? checked : value;
        
        // Ensure numSubEvents is an integer
        if (id === 'numSubEvents') {
            const num = parseInt(newValue) || 1;
            setFormData(prev => {
                let newSubEvents = [...prev.subEvents];
                // Pad or truncate subEvents array
                while (newSubEvents.length < num) {
                    newSubEvents.push(getInitialSubEvent());
                }
                return { ...prev, numSubEvents: num, subEvents: newSubEvents.slice(0, num) };
            });
            return;
        }

        setFormData(prev => ({ 
            ...prev, 
            [id]: newValue
        }));
    };
    
    const handleSubEventChange = (index, field, value) => {
        setFormData(prev => {
            const newSubEvents = [...prev.subEvents];
            newSubEvents[index] = { ...newSubEvents[index], [field]: value };
            return { ...prev, subEvents: newSubEvents };
        });
    };
    
    const handleCoCoordinatorChange = (index, field, value) => {
        setFormData(prev => {
            const newCoords = [...prev.coCoordinators];
            newCoords[index] = { ...newCoords[index], [field]: value };
            return { ...prev, coCoordinators: newCoords };
        });
    };
    
    const handleNumCoCoordinatorsChange = (e) => {
        const num = parseInt(e.target.value) || 0;
        setFormData(prev => ({ 
            ...prev, 
            numCoCoordinators: num 
            // CoCoordinators array is initialized to max 10, so only need to set num
        }));
    }
    
    // Reset form data when creation type changes (only if NOT editing)
    useEffect(() => {
        if (!isEditing) {
            setFormData(prev => ({
                ...prev,
                title: '', description: '', date: '', startTime: '', endTime: '', venueId: '', expectedAttendance: '', 
                category: creationType === 'compound' ? 'Compound' : 'Technical', 
                department: '', isTeamEvent: false, maxTeamSize: 1, posterUrl: '', websiteUrl: '',
                coCoordinators: initialMainCoordinators, numCoCoordinators: 0,
                isParent: creationType === 'compound',
                numSubEvents: creationType === 'compound' ? 1 : 0,
                subEvents: creationType === 'compound' ? [getInitialSubEvent()] : [],
            }));
        }
    }, [creationType, currentUser, isEditing]);


    // **GEMINI FEATURE 1: AI Description Drafter**
    const handleGenerateDescription = async () => {
        if (!formData.title) {
            showModal("Please enter an **Event Title** before generating a description.", 'sm');
            return;
        }

        setIsGenerating(true);
        const eventType = creationType === 'compound' ? 'Combined College Festival' : formData.category;
        const userQuery = `Draft a concise (max 80 words), exciting, and professional event description for a ${eventType} titled: "${formData.title}". The tone should be suitable for a college audience. Focus on the core benefits.`;
        const systemPrompt = `You are the Insight Agent AI for ${COLLEGE_NAME} EMS.`;
        
        const response = await callGeminiApi(userQuery, systemPrompt);
        
        if (response.success) {
            setFormData(prev => ({ ...prev, description: response.text }));
        } else {
            showModal(`AI failed to generate description. Error: ${response.text}`, 'sm');
        }
        setIsGenerating(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.department) {
             showModal("Please select the department conducting the event.", 'sm');
             return;
        }

        if (conflictResult.conflict && creationType === 'standalone') {
            showModal(`Please resolve the scheduling conflict for the Standalone Event: ${conflictResult.message}`, 'sm');
            return;
        }
        
        const eventsToSave = [];
        
        if (creationType === 'compound') {
             // Compound Event validation (including sub-event conflicts)
             if (formData.numSubEvents === 0) {
                 showModal("A Compound Event must contain at least one Sub-Event.", 'sm');
                 return;
             }
             
             // Detailed Sub-Event validation and conflict checking
             for(let i = 0; i < formData.numSubEvents; i++) {
                 const sub = formData.subEvents[i];
                 
                 if (!sub.department) {
                    showModal(`Sub-Event ${i+1} is missing the Coordinating Department.`, 'sm');
                    return;
                 }
                 
                 // Run conflict check for each sub-event
                 const subConflict = checkConflict({ 
                     ...sub, 
                     expectedAttendance: parseInt(sub.expectedAttendance),
                     _id: sub._id // Pass sub-event ID for exclusion
                 });
                 if (subConflict.conflict) {
                     showModal(`Scheduling Conflict in Sub-Event ${i+1} (${sub.title}): ${subConflict.message}`, 'sm');
                     return;
                 }
                 
                 // Team validation
                 if (sub.isTeamEvent && (parseInt(sub.maxTeamSize) < 2 || !parseInt(sub.maxTeamSize))) {
                    showModal(`Sub-Event ${i+1}: Maximum team size must be 2 or more.`, 'sm');
                    return;
                }
                
                // Co-coordinator validation
                const activeSubCoCoordinators = sub.coCoordinators
                    .slice(0, sub.numCoCoordinators);
                if (activeSubCoCoordinators.some(c => !c.name || !c.phone || !c.department)) {
                     showModal(`Sub-Event ${i+1}: Please fill out all Name, Phone, and Department fields for the selected number of Co-Coordinators.`, 'sm');
                    return;
                }
             }
        }
        
        // Validation for standalone team size
        if (creationType === 'standalone' && formData.isTeamEvent && (parseInt(formData.maxTeamSize) < 2 || !parseInt(formData.maxTeamSize))) {
            showModal("Maximum team size must be 2 or more.", 'sm');
            return;
        }

        setIsSubmitting(true);
        
        // Filter and clean up main co-coordinators
        const activeCoCoordinators = formData.coCoordinators
            .slice(0, formData.numCoCoordinators)
            .filter(c => c.name && c.phone && c.department);
            
        try {
            
            // 1. Prepare the Parent/Standalone Event
            const parentId = isEditing ? formData._id : `e${Date.now()}`;
            const parentEvent = {
                _id: parentId,
                ...formData,
                expectedAttendance: parseInt(formData.expectedAttendance) || 0,
                coordinator_id: currentUser._id, 
                tags: formData.category === 'Technical' ? ['Tech'] : ['Culture', 'Sports'],
                status: currentRole === 'Admin' ? 'Approved' : 'Pending',
                createdAt: isEditing ? eventToEdit.createdAt : Date.now(),
                isTeamEvent: creationType === 'standalone' ? formData.isTeamEvent : false,
                maxTeamSize: creationType === 'standalone' ? parseInt(formData.maxTeamSize) : 1,
                coCoordinators: activeCoCoordinators, 
                isParent: creationType === 'compound',
                parentId: null,
                category: creationType === 'compound' ? 'Compound' : formData.category, 
            };
            eventsToSave.push(parentEvent);
            
            // 2. Prepare Sub-Events if it's a Compound Event
            if (creationType === 'compound') {
                formData.subEvents.forEach((sub, index) => {
                    const subEventId = isEditing && sub._id && sub._id.startsWith(parentId) ? sub._id : `${parentId}-s${Date.now() + index}`; // Preserve ID if editing
                    
                    // Filter sub-event co-coordinators
                     const activeSubCoCoordinators = sub.coCoordinators
                        .slice(0, sub.numCoCoordinators)
                        .filter(c => c.name && c.phone && c.department);

                    eventsToSave.push({
                        _id: subEventId,
                        parentId: parentId,
                        title: `${formData.title} - ${sub.title}`, 
                        description: sub.description,
                        date: sub.date,
                        startTime: sub.startTime,
                        endTime: sub.endTime,
                        venueId: sub.venueId,
                        expectedAttendance: parseInt(sub.expectedAttendance) || 0,
                        coordinator_id: currentUser._id, // User who created the Compound Event is the main tracker
                        coordName: sub.coordName, 
                        coordPhone: sub.coordPhone,
                        department: sub.department,
                        category: sub.category,
                        isTeamEvent: sub.isTeamEvent,
                        maxTeamSize: parseInt(sub.maxTeamSize) || 1,
                        status: currentRole === 'Admin' ? 'Approved' : 'Pending', 
                        createdAt: sub.createdAt || Date.now(),
                        isParent: false,
                        coCoordinators: activeSubCoCoordinators,
                        posterUrl: parentEvent.posterUrl, 
                        websiteUrl: parentEvent.websiteUrl,
                        tags: sub.category === 'Technical' ? ['Tech'] : ['Culture', 'Sports'],
                    });
                });
            }

            // --- SAVE LOGIC ---
            if (isEditing) {
                 // Use custom edit handler to manage deletion of old subs
                 editEvent(parentEvent, eventsToSave.filter(e => e.parentId === parentId));
                 showModal(`${parentEvent.title} updated successfully!`, 'sm');
            } else {
                 updateData('events', [...events, ...eventsToSave]);
                 const successMsg = currentRole === 'Admin' 
                    ? `${parentEvent.title} created and instantly Approved! (MOCK)` 
                    : `${parentEvent.title} request submitted successfully! Awaiting Admin approval. (MOCK)`;
                 showModal(successMsg, 'sm');
                 changeView('myEvents');
            }
            

        } catch (error) {
            console.error('Error submitting event:', error);
            showModal(`Error submitting event: ${error.message}`, 'sm');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const statusColor = conflictResult.conflict ? COLORS.danger : (conflictResult.message.includes('PASS') ? COLORS.success : '#6B7280');
    const statusBg = conflictResult.conflict ? 'bg-red-50' : (conflictResult.message.includes('PASS') ? 'bg-green-50' : 'bg-gray-50');

    return (
        <>
            <h2 className="text-3xl font-bold mb-8" style={{ color: COLORS.primary }}>
                {isEditing ? `Editing: ${formData.title}` : 'Create New Event Request'}
            </h2>
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                <form onSubmit={handleSubmit}>
                    
                    {/* Creation Type (Disabled if editing) */}
                    <h3 className="text-xl font-bold pt-4 mb-4" style={{ color: COLORS.secondary }}>1. Select Creation Type</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {['standalone', 'compound'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => !isEditing && setCreationType(type)}
                                disabled={isEditing}
                                className={`py-3 rounded-lg font-bold transition duration-200 shadow-md border-2
                                    ${creationType === type 
                                        ? 'text-white border-transparent' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                style={{ 
                                    backgroundColor: creationType === type ? COLORS.primary : 'white', 
                                    color: creationType === type ? 'white' : COLORS.primary,
                                    opacity: isEditing ? 0.6 : 1
                                }}
                            >
                                {type === 'compound' ? 'Compound / Combined Event' : 'Standalone Event'}
                            </button>
                        ))}
                    </div>
                    
                    <div className="space-y-6">
                        {/* Event Details (Main/Parent) */}
                        <h3 className="text-xl font-bold pt-4" style={{ color: COLORS.secondary }}>2. Main Event Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField 
                                id="title" 
                                label={creationType === 'compound' ? "Compound Event Name (e.g., TechSpark Fest)" : "Event Title"} 
                                type="text" 
                                value={formData.title} 
                                onChange={handleChange} 
                                required 
                                placeholder={creationType === 'compound' ? "E.g., Annual Cultural Meet" : "E.g., Coding Competition"}
                            />
                            <SelectField 
                                id="department" 
                                label="Coordinating Department" 
                                value={formData.department} 
                                onChange={handleChange} 
                                required 
                                options={DEPARTMENT_OPTIONS}
                                color={COLORS.primary}
                            />
                            {creationType === 'standalone' && (
                                <SelectField 
                                    id="category" 
                                    label="Event Category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    required 
                                    options={[{_id:'Technical', name: 'Technical'}, {_id:'Non-Technical', name: 'Non-Technical'}]}
                                    color={COLORS.primary}
                                />
                            )}
                        </div>
                        
                         <InputField id="posterUrl" label="Event Poster URL (Optional)" type="url" placeholder="Paste image link for poster here (e.g. https://...)" value={formData.posterUrl} onChange={handleChange} />
                         <InputField id="websiteUrl" label="Website/Link URL (Optional)" type="url" placeholder="Paste external website link here" value={formData.websiteUrl} onChange={handleChange} />


                        {/* AI Draft Button and Description */}
                        <div className="flex space-x-4">
                            <div className='flex-grow'>
                                <TextAreaField id="description" label="Event Description" value={formData.description} onChange={handleChange} required />
                            </div>
                            <button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={isGenerating}
                                className={`h-12 mt-6 flex items-center justify-center px-4 py-2 rounded-lg font-bold text-sm transition shadow-md`}
                                style={{ backgroundColor: isGenerating ? '#9CA3AF' : COLORS.secondary, color: COLORS.primary }}
                            >
                                <icons.Sparkles className='w-4 h-4 mr-2'/>
                                {isGenerating ? 'Drafting...' : 'AI Draft'}
                            </button>
                        </div>
                        
                        {/* Coordinator Details */}
                        <h3 className="text-xl font-bold pt-4" style={{ color: COLORS.secondary }}>3. Main Coordinator & Contacts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField id="coordName" label="Main Coordinator Name" type="text" value={formData.coordName} onChange={handleChange} required />
                            <InputField id="coordPhone" label="Contact Number" type="tel" value={formData.coordPhone} onChange={handleChange} required />
                            <InputField id="coordEmail" label="Coordinator Email" type="email" value={formData.coordEmail} onChange={handleChange} required disabled/>
                        </div>
                        
                        {/* Multiple Co-Coordinators */}
                        <h3 className="text-xl font-bold pt-4" style={{ color: COLORS.secondary }}>Co-Coordinators (Max 10, Optional)</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <SelectField 
                                id="numCoCoordinators" 
                                label="Number of Co-Coordinators (Max 10)" 
                                value={formData.numCoCoordinators} 
                                onChange={handleNumCoCoordinatorsChange} 
                                required 
                                options={Array.from({ length: 11 }, (_, i) => ({_id: i, name: i === 0 ? 'None' : i}))}
                                color={COLORS.primary}
                            />
                        </div>
                        <div className='space-y-4'>
                            {/* Render only up to the selected number */}
                            {formData.coCoordinators.slice(0, formData.numCoCoordinators).map((coord, index) => (
                                <CoCoordinatorInput 
                                    key={index} 
                                    index={index} 
                                    value={coord}
                                    onChange={handleCoCoordinatorChange}
                                    departmentOptions={DEPARTMENT_OPTIONS}
                                    color={COLORS.primary}
                                />
                            ))}
                        </div>


                        {/* Compound Event: Sub-Event Creation */}
                        {creationType === 'compound' && (
                            <div className='pt-6 border-t border-gray-200'>
                                <h3 className="text-xl font-bold pt-4" style={{ color: COLORS.secondary }}>4. Sub-Event Configuration</h3>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                                    <SelectField 
                                        id="numSubEvents" 
                                        label="Number of Sub-Events" 
                                        value={formData.numSubEvents} 
                                        onChange={handleChange} 
                                        required 
                                        options={Array.from({ length: 10 }, (_, i) => ({_id: i + 1, name: i + 1}))}
                                        color={COLORS.primary}
                                    />
                                    <div className='col-span-1 md:col-span-2 p-3 bg-gray-50 rounded-lg border text-sm text-gray-600'>
                                        Define the individual activities below. Each must have its own coordinator, time, and venue.
                                    </div>
                                </div>
                                
                                {Array.from({ length: formData.numSubEvents }).map((_, index) => (
                                    <SubEventInput
                                        key={index}
                                        index={index}
                                        subEvent={formData.subEvents[index] || getInitialSubEvent()}
                                        onChange={handleSubEventChange}
                                        resources={resources}
                                        events={events} // Pass all events for conflict checking
                                        subEventId={formData.subEvents[index]?._id || null}
                                    />
                                ))}
                            </div>
                        )}
                        
                        {/* Standalone Event: Scheduling & Registration */}
                        {creationType === 'standalone' && (
                            <>
                                <h3 className="text-xl font-bold pt-4" style={{ color: COLORS.secondary }}>4. Scheduling & Resource Allocation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField id="date" label="Date" type="date" value={formData.date} onChange={handleChange} required />
                                    <InputField id="expectedAttendance" label="Expected Attendance" type="number" placeholder="e.g., 150" value={formData.expectedAttendance} onChange={handleChange} required />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InputField id="startTime" label="Start Time" type="time" value={formData.startTime} onChange={handleChange} required />
                                    <InputField id="endTime" label="End Time" type="time" value={formData.endTime} onChange={handleChange} required />
                                    <SelectField id="venueId" label="Venue / Hall" value={formData.venueId} onChange={handleChange} required options={resources} color={COLORS.primary} />
                                </div>
                                
                                <h3 className="text-xl font-bold pt-4" style={{ color: COLORS.secondary }}>5. Registration Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                                        <input type="checkbox" id="isTeamEvent" checked={formData.isTeamEvent} onChange={handleChange} className={`rounded`} style={{ color: COLORS.primary }}/>
                                        <label htmlFor="isTeamEvent" className="text-gray-700 font-semibold">Is this a Team Registration Event?</label>
                                    </div>
                                    
                                    {formData.isTeamEvent && (
                                        <InputField 
                                            id="maxTeamSize" 
                                            label="Maximum Team Size (2-10)" 
                                            type="number" 
                                            value={formData.maxTeamSize} 
                                            onChange={handleChange} 
                                            required 
                                            min="2"
                                            max="10"
                                        />
                                    )}
                                </div>
                            </>
                        )}


                        {/* SCHEDULING AGENT STATUS */}
                        {/* FIX: Ensure conflict message is visible immediately and clearly */}
                        <div id="conflict-status" className={`p-4 rounded-lg text-sm font-medium border-2`} 
                             style={{ 
                                 borderColor: statusColor, 
                                 color: statusColor, 
                                 backgroundColor: statusBg 
                             }}>
                            {conflictResult.message}
                        </div>
                        
                        {currentRole === 'Admin' && (
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="isExternal" checked={formData.isExternal} onChange={handleChange} className={`rounded`} style={{ color: COLORS.primary }}/>
                                <label htmlFor="isExternal" className="text-gray-700 font-semibold">Is this an External/Vetted Event?</label>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={conflictResult.conflict || isSubmitting}
                            className={`w-full text-white font-bold py-3 rounded-lg transition shadow-xl`}
                            style={{ backgroundColor: (conflictResult.conflict || isSubmitting) ? '#9CA3AF' : COLORS.primary }}
                        >
                            {isSubmitting ? 'Submitting...' : isEditing ? 'Save Changes' : (conflictResult.conflict ? 'Resolve Conflict to Submit' : 'Submit Event Request')}
                        </button>
                        
                        {isEditing && (
                             <button
                                type="button"
                                onClick={() => changeView('myEvents')}
                                className="w-full mt-2 py-3 rounded-lg text-gray-700 font-bold transition duration-200 shadow-md bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
};

// --- COORDINATOR VIEW: Participants Modal (Used for read-only view) ---
const ParticipantsModal = ({ event, onClose }) => {
    const { state } = React.useContext(AppContext);
    // Filter all registrations for this event
    const registrations = state.attendanceRecords.filter(a => a.eventId === event._id);

    return (
        <div className='space-y-6'>
            {/* Added back button for modal */}
            <button 
                onClick={onClose} 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-semibold transition p-1 rounded-lg"
            >
                <icons.ArrowLeft className='w-5 h-5'/>
                <span>Back to My Events</span>
            </button>

            <h3 className="text-2xl font-bold border-b pb-2" style={{ color: COLORS.primary }}>
                Registered Participants for: {event.title}
            </h3>
            <div className='p-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm'>
                <p className='font-semibold'>Total Registrations: <span className='text-lg' style={{color: COLORS.secondary}}>{registrations.length}</span></p>
                <p className='font-semibold'>Event Type: {event.isTeamEvent ? `Team (Max: ${event.maxTeamSize})` : 'Individual'}</p>
            </div>

            <div className="bg-white rounded-xl overflow-x-auto border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team / Leader</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department / Year</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            {event.isTeamEvent && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Members (Details)</th>}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {registrations.map((reg) => (
                            <tr key={reg.id}>
                                {/* Team / Leader */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {reg.isTeamEvent ? (
                                        <>
                                            <span className='font-bold' style={{ color: COLORS.primary }}>{reg.teamName}</span>
                                            <div className='text-xs text-gray-500'>{reg.regName} (Lead)</div>
                                        </>
                                    ) : (
                                        reg.regName
                                    )}
                                </td>
                                {/* Department / Year */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className='font-semibold'>{reg.regDept}</span> / <span>{reg.regYear}</span>
                                </td>
                                {/* Contact */}
                                <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-700">
                                    <div className='font-medium'>{reg.regPhone}</div>
                                    <div className='text-gray-500'>{reg.regEmail}</div>
                                </td>
                                {/* Team Members (Conditional) */}
                                {event.isTeamEvent && (
                                    <td className="px-4 py-4 text-xs text-gray-700 max-w-xs">
                                        <ul className='list-disc list-inside space-y-1 pl-1'>
                                            {reg.teamMembers.map((member, index) => (
                                                <li key={index} className='truncate'>
                                                    **{member.name}** ({member.dept}, {member.year})
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                )}
                                {/* Check-in Status */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                        ${reg.is_present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {reg.is_present ? 'PRESENT' : 'ABSENT'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {registrations.length === 0 && <p className="p-4 text-center text-gray-500">No participants have registered yet.</p>}
            </div>
            {/* Added generic close button for consistency if backdrop click is missed */}
             <div className="flex justify-end mt-6"> 
                <button 
                    onClick={onClose} 
                    className={`text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition shadow-md`}
                    style={{ backgroundColor: COLORS.primary }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// --- COORDINATOR VIEW: My Events ---
const MyEvents = () => {
    const { state, showModal, closeModal, deleteEvent } = React.useContext(AppContext);
    const { events, currentUser, attendanceRecords } = state;

    if (!checkRole(state, ['Coordinator'])) return <UnauthorizedView />;
    
    // Find events coordinated by this user (either main coordinator or co-coordinator)
    const myEvents = events.filter(e => 
        e.coordinator_id === currentUser?._id || 
        (e.coCoordinators && e.coCoordinators.some(c => c.name === currentUser?.displayName))
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    const handleViewParticipants = (event) => {
        const isCompoundEvent = event.isParent && event.category === 'Compound';
        
        if (isCompoundEvent) {
            // FIX: Allow coordinators to view the details modal to see sub-events
            showModal(<EventDetailsModal event={event} onClose={closeModal} />, 'lg');
            return;
        }
        showModal(<ParticipantsModal event={event} onClose={closeModal} />, 'lg');
    };
    
    const handleDeleteEvent = (event) => {
        showModal((
            <>
                <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.danger }}>Confirm Deletion</h3>
                <p className='text-gray-700'>Are you sure you want to delete the event: <strong>{event.title}</strong>?</p>
                {event.isParent && <p className='mt-2 text-sm font-semibold text-red-600'>NOTE: This is a Compound Event. Deleting it will also permanently delete all {events.filter(e => e.parentId === event._id).length} associated Sub-Events and all registration records for them.</p>}
                <div className='flex justify-end space-x-3 mt-6'>
                    <button onClick={closeModal} className='bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold'>Cancel</button>
                    <button onClick={() => deleteEvent(event._id)} className='bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700'>
                        <icons.Trash className='w-5 h-5 inline-block mr-1'/> DELETE
                    </button>
                </div>
            </>
        ), 'md');
    };

    const handleEditEvent = (event) => {
        showModal(<CreateEventForm eventToEdit={event} isEditing={true} />, 'lg');
    };
    
    const getRegistrantsCount = (eventId) => {
        return attendanceRecords.filter(a => a.eventId === eventId).length;
    };

    return (
        <>
            <h2 className="text-3xl font-bold mb-8" style={{ color: COLORS.primary }}>My Coordinated Events</h2>
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Dept</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Venue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrants</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {myEvents.map((event) => {
                            const isCompoundEvent = event.isParent && event.category === 'Compound';
                            return (
                                <tr key={event._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {isCompoundEvent && <icons.Layers className='w-4 h-4 inline-block mr-2' style={{color: COLORS.secondary}}/>}
                                        {event.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {isCompoundEvent ? 'Compound Event' : (event.parentId ? 'Sub-Event' : 'Standalone')}<br/>
                                        <span className='font-semibold' style={{color: COLORS.primary}}>{event.department}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {event.date} @ {event.startTime}<br/>
                                        <span className='font-semibold' style={{color: COLORS.secondary}}>{MOCK_DATA.resources.find(r => r._id === event.venueId)?.name || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold" style={{color: COLORS.primary}}>
                                        {/* FIX: Show registrants only for Standalone/Sub-Events */}
                                        {isCompoundEvent ? '-' : getRegistrantsCount(event._id)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2 justify-end">
                                        <button 
                                            onClick={() => handleViewParticipants(event)}
                                            className="text-white px-3 py-2 rounded-lg text-xs font-semibold"
                                            style={{backgroundColor: isCompoundEvent ? COLORS.secondary : COLORS.secondary, color: COLORS.primary}}
                                        >
                                            {isCompoundEvent ? 'VIEW SUB-EVENTS' : 'VIEW PARTICIPANTS'}
                                        </button>
                                        <button
                                            onClick={() => handleEditEvent(event)}
                                            className="text-white px-3 py-2 rounded-lg text-xs font-semibold bg-gray-500 hover:bg-gray-600 transition"
                                        >
                                            <icons.Edit className='w-4 h-4 inline-block' /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event)}
                                            className="text-white px-3 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 transition"
                                        >
                                            <icons.Trash className='w-4 h-4 inline-block' /> Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {myEvents.length === 0 && <p className="p-4 text-center text-gray-500">You are not coordinating any events yet.</p>}
            </div>
        </>
    );
};

// --- NEW VIEW: Event Check-In ---
const EventCheckIn = () => {
    const { state, updateAttendanceStatus } = React.useContext(AppContext);
    const { events, currentUser, attendanceRecords } = state;

    if (!checkRole(state, ['Coordinator', 'Admin'])) return <UnauthorizedView />;

    // Events coordinated by the user for the dropdown filter (Sub-Events and Standalone Only)
    const myEventsForCheckin = events.filter(e => 
        !e.isParent && (e.coordinator_id === currentUser?._id || 
        (e.coCoordinators && e.coCoordinators.some(c => c.name === currentUser?.displayName)))
    );
    
    const [selectedEventId, setSelectedEventId] = useState('');
    const [registrations, setRegistrations] = useState([]);
    
    const selectedEvent = events.find(e => e._id === selectedEventId);

    // Filter registrations based on selected event
    useEffect(() => {
        if (selectedEventId) {
            const eventRegs = attendanceRecords.filter(a => a.eventId === selectedEventId);
            setRegistrations(eventRegs);
        } else {
            setRegistrations([]);
        }
    }, [selectedEventId, attendanceRecords]);

    const handleMarkAttendance = (attendanceId, isPresent) => {
        updateAttendanceStatus(attendanceId, isPresent);
        // UI naturally updates because of state change
    };

    return (
        <>
            <h2 className="text-3xl font-bold mb-8" style={{ color: COLORS.primary }}>Event Check-In Console</h2>
            
            <div className='bg-white p-6 rounded-xl shadow-lg mb-8'>
                <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.primary }}>1. Select Event for Check-In (Sub-Events/Standalone Only)</h3>
                <SelectField 
                    id="eventSelector" 
                    label="Select Event" 
                    value={selectedEventId} 
                    onChange={(e) => setSelectedEventId(e.target.value)} 
                    required 
                    options={[{_id: '', name: '-- Select Event --'}, ...myEventsForCheckin.map(e => ({_id: e._id, name: `${e.title} (${e.department})`}))]}
                    color={COLORS.secondary}
                />
            </div>
            
            {selectedEventId && (
                <div className='bg-white p-6 rounded-xl shadow-lg'>
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: COLORS.primary }}>
                         <icons.ListChecks className='w-5 h-5'/>
                        <span>2. Participant Attendance List ({selectedEvent?.title.replace(selectedEvent?.parentId ? events.find(p => p._id === selectedEvent.parentId)?.title + ' - ' : '', '')})</span>
                    </h3>
                    
                    <div className='text-sm text-gray-700 mb-4'>
                        <span className='font-semibold'>Total Registrations: </span>{registrations.length} | 
                        <span className='font-semibold ml-4'>Checked In: </span>{registrations.filter(r => r.is_present).length}
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team / Leader</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept / Year</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Size</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {registrations.map((reg) => (
                                    <tr key={reg.id} className={reg.is_present ? 'bg-green-50' : 'hover:bg-gray-50'}>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                            {/* FIX: Display Team Name (if exists) and Leader Name clearly */}
                                            {reg.isTeamEvent && <span className='font-bold' style={{ color: COLORS.primary }}>{reg.teamName}</span>}
                                            <div classNameName='text-xs text-gray-500'>Leader: {reg.regName}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <span className='font-semibold'>{reg.regDept}</span> / <span>{reg.regYear}</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {reg.teamSize}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                ${reg.is_present ? 'bg-green-600 text-white' : 'bg-red-100 text-red-800'}`}>
                                                {reg.is_present ? 'PRESENT' : 'ABSENT'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleMarkAttendance(reg.id, !reg.is_present)}
                                                className={`text-white px-3 py-1 rounded-lg text-xs font-semibold transition shadow-md 
                                                    ${reg.is_present ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                            >
                                                {reg.is_present ? 'Mark Absent' : 'Mark Present'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {registrations.length === 0 && <p className="p-4 text-center text-gray-500">No participants registered for this event yet.</p>}
                    </div>
                </div>
            )}
        </>
    );
};

// --- ADMIN VIEWS ---

const AdminQueue = () => {
    const { state, showModal } = React.useContext(AppContext);
    const { events, currentRole } = state;
    const { checkConflict, updateEventStatus } = useAgents();

    if (currentRole !== 'Admin') return <UnauthorizedView />;

    // Sort by creation date (mocked) to show newest first
    const pendingEvents = [...events].sort((a, b) => b.createdAt - a.createdAt).filter(e => e.status === 'Pending');

    const handleUpdateStatus = (eventId, newStatus) => {
        updateEventStatus(eventId, newStatus);
        showModal(`Event status updated to ${newStatus}. (MOCK)`, 'sm');
    };

    const renderQueueRow = (event) => {
        const organizer = event.coordName || 'Unknown';
        // Only check conflict for Standalone/Sub-Events
        const isConflictCheckable = !event.isParent;
        const conflictResult = isConflictCheckable ? checkConflict(event) : { conflict: false, suggestions: [] };
        
        const statusColor = conflictResult.conflict ? COLORS.danger : COLORS.success;
        const statusText = conflictResult.conflict ? 'CONFLICT' : 'PASS';

        return (
            <div key={event._id} className="bg-white p-5 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 border-gray-200 hover:shadow-xl transition">
                <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-xl font-bold truncate" style={{ color: COLORS.primary }}>
                        {event.isParent && <icons.Layers className='w-4 h-4 inline-block mr-2' style={{color: COLORS.secondary}}/>}
                        {event.title}
                        <span className='text-sm text-gray-500 ml-2'>({event.isParent ? 'Compound Event' : (event.parentId ? 'Sub-Event' : 'Standalone')})</span>
                    </h4>
                    <p className="text-sm text-gray-500">By {organizer} | {event.date} @ {event.startTime}</p>
                    {isConflictCheckable && (
                        <p className={`text-sm font-medium mt-1 p-1 rounded-md`} style={{ color: statusColor }}>
                            Agent Status: {statusText}
                            {conflictResult.suggestions.length > 0 && 
                                <span className="font-normal text-xs ml-2 text-gray-500">({conflictResult.suggestions.join(' / ')})</span>}
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-3 mt-3 md:mt-0">
                    <button onClick={() => handleUpdateStatus(event._id, 'Approved')} className="bg-green-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-green-700 transition shadow-md">
                        Approve
                    </button>
                    <button onClick={() => handleUpdateStatus(event._id, 'Rejected')} className="bg-red-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-red-700 transition shadow-md">
                        Reject
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <h2 className="text-3xl font-bold mb-8" style={{ color: COLORS.primary }}>Event Approval Queue</h2>
            <p className="text-lg text-gray-700 mb-6">Scheduling Agent pre-checks all requests. Review carefully before approval.</p>
            <div className="space-y-6">
                {pendingEvents.length > 0 ? pendingEvents.map(renderQueueRow) : (
                    <div className="p-8 bg-white rounded-xl shadow-lg text-center">
                        <p className="text-lg text-gray-600">No pending events requiring approval.</p>
                    </div>
                )}
            </div>
        </>
    );
};

const AdminAnalytics = () => {
    const { state } = React.useContext(AppContext);
    const { currentRole, events, feedback } = state;
    const { getAnalyticsData } = useAgents();

    const [summaryResult, setSummaryResult] = useState("Click 'Generate AI Summary' to analyze feedback data.");
    const [isSummarizing, setIsSummarizing] = useState(false);

    if (currentRole !== 'Admin') return <UnauthorizedView />;
    
    const { leaderboard, resourceUsage } = getAnalyticsData();

    // **GEMINI FEATURE 2: AI Feedback Summarizer**
    const handleGenerateSummary = async () => {
        if (feedback.length === 0) {
            setSummaryResult("No feedback data available to summarize.");
            return;
        }

        setIsSummarizing(true);
        setSummaryResult("Analyzing feedback using Gemini LLM... Please wait.");
        
        // Prepare data for the LLM
        const feedbackData = feedback.map(f => `Event ID: ${f.eventId}, Rating: ${f.rating}/5, Comment: "${f.comment}"`).join('\n');
        
        const userQuery = `Analyze the following raw event feedback data. Provide a concise summary (max 150 words) structured in three bullet points: 1) Overall Sentiment and Rating, 2) Key Areas for Improvement (Logistics/Venue), and 3) Top Positive Highlights. Data:\n\n${feedbackData}`;
        const systemPrompt = `You are the Insight Agent AI for ${COLLEGE_NAME} EMS. Your task is to transform raw event feedback into clear, actionable business intelligence for the administration.`;

        const response = await callGeminiApi(userQuery, systemPrompt);

        if (response.success) {
            setSummaryResult(response.text);
        } else {
            setSummaryResult(`AI Summary Failed: ${response.text}`);
        }
        setIsSummarizing(false);
    };


    const sortedLeaderboard = useMemo(() => Object.entries(leaderboard)
        .sort(([, a], [, b]) => b - a)
        .map(([dept, attendees], index) => (
            <li key={dept} className="flex justify-between py-3 border-b border-gray-100 items-center">
                <span className="font-semibold flex items-center space-x-2" style={{ color: COLORS.primary }}>
                    <span className='w-6 font-extrabold' style={{ color: COLORS.secondary }}>{index + 1}.</span> 
                    <span>{dept}</span>
                </span>
                <span className="font-bold text-lg" style={{ color: COLORS.secondary }}>{attendees} Attendees</span>
            </li>
        )), [leaderboard]);
    
    const resourceRows = useMemo(() => Object.entries(resourceUsage).map(([name, count]) => (
        <li key={name} className="flex justify-between py-3 border-b border-gray-100 items-center">
            <span className="text-gray-700 font-semibold flex items-center space-x-2">
                <icons.Home className='w-5 h-5 text-gray-400'/>
                <span>{name}</span>
            </span>
            <span className="font-bold text-lg" style={{ color: COLORS.primary }}>{count} Bookings</span>
        </li>
    )), [resourceUsage]);

    return (
        <>
            <h2 className="text-3xl font-bold mb-8" style={{ color: COLORS.primary }}>Reports & Analytics (Insight Agent)</h2>
            
            {/* AI FEEDBACK SUMMARIZER */}
            <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 mb-8" style={{ borderTopColor: COLORS.secondary }}>
                <h3 className="text-xl font-bold mb-3 flex items-center space-x-2" style={{ color: COLORS.primary }}>
                    <icons.Sparkles className='w-6 h-6' style={{ color: COLORS.secondary }}/>
                    <span>AI Feedback Summary</span>
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm text-gray-700 min-h-[100px] border border-gray-200">
                    {summaryResult}
                </div>
                <button
                    onClick={handleGenerateSummary}
                    disabled={isSummarizing || feedback.length === 0}
                    className={`mt-4 flex items-center justify-center px-4 py-2 rounded-lg font-bold text-sm transition shadow-md`}
                    style={{ backgroundColor: (isSummarizing || feedback.length === 0) ? '#9CA3AF' : COLORS.secondary, color: COLORS.primary }}
                >
                    {isSummarizing ? 'Analyzing...' : `Generate AI Summary (${feedback.length} records)`}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Leaderboard */}
                <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4" style={{ borderTopColor: COLORS.secondary }}>
                    <h3 className="text-xl font-bold mb-5 border-b pb-3 flex items-center space-x-2" style={{ color: COLORS.primary }}>
                        <icons.Users className='w-6 h-6' style={{ color: COLORS.secondary }}/>
                        <span>Club Engagement Leaderboard (Gamification)</span>
                    </h3>
                    <ul className="divide-y-0">
                        {sortedLeaderboard.length > 0 ? sortedLeaderboard : <p className='text-gray-500'>No validated attendance data yet.</p>}
                    </ul>
                </div>
                
                {/* Resource Usage */}
                <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4" style={{ borderTopColor: COLORS.primary }}>
                    <h3 className="text-xl font-bold mb-5 border-b pb-3 flex items-center space-x-2" style={{ color: COLORS.primary }}>
                        <icons.Home className='w-6 h-6' style={{ color: COLORS.primary }}/>
                        <span>Resource Utilization Map</span>
                    </h3>
                    <ul className="divide-y-0">
                        {resourceRows.length > 0 ? resourceRows : <p className='text-gray-500'>No resources booked yet.</p>}
                    </ul>
                </div>
            </div>
        </>
    );
};

// --- UTILITY COMPONENTS ---

const InputField = ({ id, label, type, placeholder, value, onChange, required, disabled, min, max, name }) => (
    <label className="block">
        <span className="text-gray-700 font-semibold">{label}</span>
        <input 
            type={type} 
            id={id} 
            name={name || id} // Added name prop for handling multiple inputs with one handler
            placeholder={placeholder} 
            value={value} 
            onChange={onChange} 
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            className={`mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500`}
            style={{ borderColor: COLORS.primary }}
        />
    </label>
);

const TextAreaField = ({ id, label, value, onChange, required }) => (
    <label className="block">
        <span className="text-gray-700 font-semibold">{label}</span>
        <textarea 
            id={id} 
            rows="3" 
            value={value} 
            onChange={onChange} 
            required={required}
            className={`mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-2`}
            style={{ borderColor: COLORS.primary }}
        ></textarea>
    </label>
);

const SelectField = ({ id, label, value, onChange, required, options, color }) => (
    <label className="block">
        <span className="text-gray-700 font-semibold">{label}</span>
        <select 
            id={id} 
            value={value} 
            onChange={onChange} 
            required={required}
            className={`mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 bg-white focus:ring-2`}
            style={{ borderColor: color }}
        >
            <option value="" disabled>Select an option</option>
            {options.map(opt => (
                // Use opt._id as key and value for compatibility with array format options
                <option key={opt._id} value={opt._id} data-capacity={opt.capacity}>
                    {opt.name} {opt.capacity ? `(Cap: ${opt.capacity})` : ''}
                </option>
            ))}
        </select>
    </label>
);


// --- MAIN APP COMPONENT ---

const App = () => {
  const { state } = React.useContext(AppContext);
  const { isAuthReady, isAuthenticated, currentView, error } = state;

  const renderContent = () => {
    if (error) return <div className='p-10 text-red-600'>{error}</div>;
    
    // Auth is ready, but user is not logged in
    if (!isAuthenticated) return <LoginScreen />;
    
    // User is authenticated, render content based on view
    const content = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'availableEvents':
                return <AvailableEvents />;
            case 'myApplications':
                return <MyApplications />;
            case 'createEvent':
                return <CreateEventForm />;
            case 'myEvents': // Coordinator's own events dashboard (Read-Only List)
                return <MyEvents />;
            case 'eventCheckIn': // NEW: Coordinator's attendance marking tool
                return <EventCheckIn />;
            case 'adminQueue':
                return <AdminQueue />;
            case 'adminAnalytics':
                return <AdminAnalytics />;
            case 'adminResources':
                return <UnauthorizedView />; // Placeholder views
            default:
                return <DashboardOverview />;
        }
    };
    
    return (
        <div className='flex'>
            <Sidebar />
            <main className="flex-grow p-8 bg-gray-50 min-h-[calc(100vh-64px)] max-w-[calc(100vw-240px)]">
              {content()}
            </main>
        </div>
    );
  };
  
  // Renders the loading spinner/initial view before auth check is complete
  if (!isAuthReady) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-400"></div>
              <p className="mt-4 text-lg font-semibold text-gray-700">Initializing Secure System...</p>
          </div>
      );
  }

  return (
    <>
      <Header />
      {renderContent()}
      <Modal />
    </>
  );
};

const Root = () => (
    <div style={{ backgroundColor: '#F3F4F6' }}>
        <AppProvider>
            <App />
        </AppProvider>
    </div>
);

export default Root;

