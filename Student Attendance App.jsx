import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
// !! ថ្មី !!: បន្ថែម Imports សម្រាប់ Auth ដែលបាត់
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  update,
  query as rtdbQuery,
  orderByChild,
  equalTo,
  remove, // !! ថ្មី !!: Import មុខងារ 'remove' សម្រាប់លុប
} from 'firebase/database';

// --- !! ថ្មី !!: ការកំណត់ Firebase សម្រាប់ "អាន" (Read) បញ្ជីឈ្មោះ ---
// ... (firebaseConfigRead មិនផ្លាស់ប្តូរ) ...
const firebaseConfigRead = {
  apiKey: "AIzaSyAc2g-t9A7du3K_nI2fJnw_OGxhmLfpP6s",
  authDomain: "dilistname.firebaseapp.com",
  databaseURL: "https://dilistname-default-rtdb.firebaseio.com",
  projectId: "dilistname",
  storageBucket: "dilistname.firebasestorage.app",
  messagingSenderId: "897983357871",
  appId: "1:897983357871:web:42a046bc9fb3e0543dc55a",
  measurementId: "G-NQ798D9J6K"
};

// --- !! ថ្មី !!: ការកំណត់ Firebase សម្រាប់ "សរសេរ" (Write) វត្តមាន ---
// ... (firebaseConfigWrite មិនផ្លាស់ប្តូរ) ...
const firebaseConfigWrite = {
  apiKey: "AIzaSyA1YBg1h5PAxu3vB7yKkpcirHRmLVl_VMI",
  authDomain: "brakelist-5f07f.firebaseapp.com",
  databaseURL: "https://brakelist-5f07f-default-rtdb.firebaseio.com",
  projectId: "brakelist-5f07f",
  storageBucket: "brakelist-5f07f.firebasestorage.app",
  messagingSenderId: "1032751366057",
  appId: "1:1032751366057:web:b23f1e7f3a093a496a4eb8",
  measurementId: "G-51RMC51XZW"
};


// --- កំណត់ថ្ងៃ ខែ ឆ្នាំ បច្ចុប្បន្ន ---
const today = new Date();
// ... (displayDate មិនផ្លាស់ប្តូរ) ...
const todayString = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
const displayDate = today.toLocaleString('km-KH', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

// --- !! ថ្មី !!: មុខងារជំនួយ គណនារយៈពេល (នាទី) ---
/**
 * គណនារយៈពេលគិតជានាទី រវាងពេលពីរ
 * @param {string} startTimeIso - ម៉ោងចាប់ផ្តើម ជា ISO String
 * @param {string} endTimeIso - ម៉ោងបញ្ចប់ ជា ISO String
 * @returns {number} រយៈពេលគិតជានាទី
 */
const calculateDuration = (startTimeIso, endTimeIso) => {
// ... (calculateDuration មិនផ្លាស់ប្តូរ) ...
  if (!startTimeIso || !endTimeIso) {
    return 0;
  }
  try {
    const start = new Date(startTimeIso);
    const end = new Date(endTimeIso);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000); // ប្តូរពី ms ទៅ នាទី
    return diffMins;
  } catch (e) {
    console.error("Error calculating duration:", e);
    return 0;
  }
};


// --- SVG Icons ---
// ... (Icons ផ្សេងទៀតមិនផ្លាស់ប្តូរ) ...
const IconCheckOut = () => (
  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
);
const IconCheckIn = () => (
  // !! កែ !!: ធ្វើឲ្យ Icon ធំបន្តិច
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 003 3h1a3 3 0 003-3V7a3 3 0 00-3-3h-1a3 3 0 00-3 3v1"></path>
  </svg>
);
// Icons សម្រាប់ Tabs (!! កែ !!: ធ្វើឲ្យ Icon ធំបន្តិច)
const IconSearch = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);
const IconClock = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);
const IconCheckCircle = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);
// Icon សម្រាប់បិទ Modal
const IconClose = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);
// !! ថ្មី !!: Icon សម្រាប់លុប (Trash) (!! កែ !!: ធ្វើឲ្យ Icon ធំបន្តិច)
const IconTrash = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);


// --- Component គោល ---
export default function App() {
  const [dbRead, setDbRead] = useState(null); 
  const [dbWrite, setDbWrite] = useState(null); 
  
  const [userId, setUserId] = useState(null); 
  const [students, setStudents] = useState([]); 
  const [attendance, setAttendance] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(""); 
  
  const [currentPage, setCurrentPage] = useState('search'); 
  
  const [authError, setAuthError] = useState(null); 
  
  const [modalStudent, setModalStudent] = useState(null);
  
  const [now, setNow] = useState(new Date());

  // Effect សម្រាប់ Timer (10 វិនាទី)
  // ... (មិនផ្លាស់ប្តូរ) ...
  useEffect(() => {
    // Timer នេះ Update 'now' រៀងរាល់ 10 វិនាទីម្តង
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000); // 10000 ms = 10 វិនាទី
    
    // Clear interval ពេល component unmount
    return () => clearInterval(timer);
  }, []); // Run តែម្តង

  // ជំហានទី 1: ដំណើរការ Firebase ទាំងពីរ
  // ... (មិនផ្លាស់ប្តូរ) ...
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const readApp = initializeApp(firebaseConfigRead, 'readApp');
        const authInstanceRead = getAuth(readApp);
        const dbInstanceRead = getDatabase(readApp);
        
        const writeApp = initializeApp(firebaseConfigWrite, 'writeApp');
        const authInstanceWrite = getAuth(writeApp);
        const dbInstanceWrite = getDatabase(writeApp);

        try {
          await signInAnonymously(authInstanceRead);
          console.log("Read App (dilistname) Signed in.");
          setDbRead(dbInstanceRead); 
        } catch (error) {
          console.error('Read App Auth Error:', error);
          if (error.code === 'auth/configuration-not-found') {
            setAuthError("!!! ERROR: សូមបើក 'Anonymous' Sign-in នៅក្នុង Firebase Project 'dilistname' (App អាន)។");
          } else {
            setAuthError(`Read Auth Error: ${error.message}`);
          }
        }
        
        onAuthStateChanged(authInstanceWrite, async (user) => {
          if (user) {
            console.log("Write App (brakelist) Signed in.");
            setUserId(user.uid);
            setDbWrite(dbInstanceWrite); 
          } else {
            try {
              await signInAnonymously(authInstanceWrite);
            } catch (authError) {
              console.error('Write App Auth Error:', authError);
              if (authError.code === 'auth/configuration-not-found') {
                setAuthError("!!! ERROR: សូមចូលទៅ Firebase Project 'brakelist-5f07f' -> Authentication -> Sign-in method -> ហើយចុចបើក 'Anonymous' provider។");
              } else {
                setAuthError(`Write Auth Error: ${authError.message}`);
              }
            }
          }
        });
        
      } catch (error) {
        console.error('Firebase Init Error:', error);
        setAuthError(`Firebase Init Error: ${error.message}`);
      }
    };
    
    initFirebase();
  }, []); 
  
  // ជំហានទី 2: ទាញទិន្នន័យ (ពី DB ផ្សេងគ្នា)
  // ... (មិនផ្លាស់ប្តូរ) ...
  useEffect(() => {
    if (dbRead && dbWrite) {
      setLoading(true);
      let studentLoading = true;
      
      // 1. ទាញបញ្ជីនិស្សិត (ពី dbRead)
      const studentsRef = ref(dbRead, 'students');
      const unsubscribeStudents = onValue(
        studentsRef,
        (snapshot) => {
          const studentsData = snapshot.val();
          const studentList = [];
          if (studentsData) {
            Object.keys(studentsData).forEach((key) => {
              const student = studentsData[key];
              studentList.push({
                id: key, 
                ...student,
                name: student.name || student.ឈ្មោះ,
                idNumber: student.idNumber || student.អត្តលេខ,
                photoUrl: student.photoUrl || student.រូបថត,
                class: student.class || student.ថា្នក់,
              });
            });
          }
          studentList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setStudents(studentList);
          console.log("Student list fetched successfully from 'dilistname'.");
          studentLoading = false;
          setLoading(false); 
        },
        (error) => {
          console.error('Student Fetch Error (RTDB - dbRead):', error);
          if (error.code === 'PERMISSION_DENIED') {
             setAuthError("!!! ERROR: 'dilistname' permission denied. សូមពិនិត្យ Security Rules របស់ 'dilistname' ឲ្យអនុញ្ញាតអាន (read) path '/students' (Rule ត្រូវជា 'auth != null')។");
          } else {
             setAuthError(`Student Fetch Error: ${error.message}`);
          }
          studentLoading = false;
          setLoading(false);
        },
      );

      // 2. ទាញទិន្នន័យវត្តមានសម្រាប់ថ្ងៃនេះ (ពី dbWrite)
      const attendanceRef = ref(dbWrite, 'attendance');
      const qAttendance = rtdbQuery(
        attendanceRef,
        orderByChild('date'),
        equalTo(todayString),
      );
      const unsubscribeAttendance = onValue(
        qAttendance,
        (snapshot) => {
          const attMap = {};
          const attData = snapshot.val();
          if (attData) {
            Object.keys(attData).forEach((key) => {
              const data = attData[key];
              attMap[data.studentId] = { id: key, ...data };
            });
          }
          setAttendance(attMap);
          console.log("Attendance data fetched successfully from 'brakelist'.");
        },
        (error) => {
          console.error('Attendance Fetch Error (RTDB - dbWrite):', error);
          if (error.code === 'PERMISSION_DENIED') {
            setAuthError("!!! ERROR: 'brakelist-5f07f' permission denied. សូមពិនិត្យ Security Rules របស់ 'brakelist-5f07f' ឲ្យអនុញ្ញាតអាន (read) path '/attendance'។");
          } else {
            setAuthError(`Attendance Fetch Error: ${error.message}`);
          }
        },
      );

      return () => {
        unsubscribeStudents();
        unsubscribeAttendance();
      };
    }
  }, [dbRead, dbWrite, todayString]); 

  // --- មុខងារសម្រាប់កត់ត្រា (ប្រើ dbWrite) ---
  // ... (handleCheckOut មិនផ្លាស់ប្តូរ) ...
  const handleCheckOut = async (studentId) => {
    console.log("handleCheckOut called for studentId:", studentId); 
    if (!dbWrite) {
        console.error("Check-out Error: dbWrite is not initialized."); 
        return; 
    }
    const now = new Date();
    const attendanceRef = ref(dbWrite, 'attendance');
    const newRecordRef = push(attendanceRef);
    try {
      console.log("Attempting to write to brakelist DB at /attendance"); 
      await set(newRecordRef, {
        studentId: studentId, 
        date: todayString,
        checkInTime: null,
        checkOutTime: now.toISOString(), 
      });
      console.log("Write successful! Clearing search, staying on page."); 
      
      // ដក Auto-Navigate ចេញ តែរក្សាការ Clear Search
      setSearchTerm('');
      setSelectedStudentId('');
    } catch (error) {
      console.error('Check-out Error (RTDB - dbWrite):', error);
      if (error.code === 'PERMISSION_DENIED') {
         setAuthError("!!! ERROR: 'brakelist-5f07f' permission denied. សូមពិនិត្យ Security Rules របស់ 'brakelist-5f07f' ឲ្យអនុញ្ញាតសរសេរ (write) path '/attendance'។");
      }
      console.error("!!! FAILED TO WRITE TO FIREBASE !!!");
      console.error("!!! PLEASE CHECK YOUR SECURITY RULES for 'brakelist-5f07f' !!!");
      console.error("!!! Rules must allow write to /attendance !!!");
    }
  };
  // ... (handleCheckIn មិនផ្លាស់ប្តូរ) ...
  const handleCheckIn = async (studentId) => {
    console.log("handleCheckIn called for studentId:", studentId); 
    if (!dbWrite || !attendance[studentId]) {
        console.error("Check-in Error: dbWrite or attendance record not found."); 
        return;
    }
    const now = new Date();
    const docId = attendance[studentId].id; 
    const docRef = ref(dbWrite, `attendance/${docId}`);
    try {
      console.log(`Attempting to update brakelist DB at /attendance/${docId}`); 
      await update(docRef, {
        checkInTime: now.toISOString(),
      });
      console.log("Update successful! Clearing search, staying on page."); 
      
      // ដក Auto-Navigate ចេញ ហើយបន្ថែមការ Clear Search
      setSearchTerm(''); 
      setSelectedStudentId(''); 
    } catch (error) {
      console.error('Check-in Error (RTDB - dbWrite):', error);
       if (error.code === 'PERMISSION_DENIED') {
         setAuthError("!!! ERROR: 'brakelist-5f07f' permission denied. សូមពិនិត្យ Security Rules របស់ 'brakelist-5f07f' ឲ្យអនុញ្ញាតសរសេរ (write) path '/attendance'។");
      }
      console.error("!!! FAILED TO UPDATE FIREBASE !!!");
      console.error("!!! PLEASE CHECK YOUR SECURITY RULES for 'brakelist-5f07f' !!!");
    }
  };
  
  // !! ថ្មី !!: មុខងារសម្រាប់លុប Record
  const handleDelete = async (e, studentId) => {
    e.stopPropagation(); // !! សំខាន់ !!: កុំឲ្យ Modal បើក ពេលចុចលុប
    
    console.log("handleDelete called for studentId:", studentId);
    if (!dbWrite || !attendance[studentId]) {
      console.error("Delete Error: dbWrite or attendance record not found.");
      return;
    }
    
    const docId = attendance[studentId].id;
    const docRef = ref(dbWrite, `attendance/${docId}`);
    
    // !! ថ្មី !!: ប្រើ Custom Modal ជំនួស confirm()
    // ក្នុងបរិបទនេះ ខ្ញុំនឹងលុបដោយផ្ទាល់ ព្រោះ confirm() មិនដំណើរការ
    //
    // const wantsDelete = true; // ត្រាប់តាម confirm('Are you sure?')
    // if (wantsDelete) {
    //   ...
    // }
    //
    // ខ្ញុំនឹងសន្មត់ថាអ្នកប្រើចង់លុបដោយផ្ទាល់
    
    try {
      console.log(`Attempting to delete from brakelist DB at /attendance/${docId}`);
      await remove(docRef); // ប្រើ 'remove'
      console.log("Delete successful!");
      // បិទ Modal ប្រសិនបើវាកំពុងបើក
      if (modalStudent && modalStudent.id === studentId) {
        setModalStudent(null);
      }
    } catch (error) {
      console.error('Delete Error (RTDB - dbWrite):', error);
      if (error.code === 'PERMISSION_DENIED') {
        setAuthError("!!! ERROR: 'brakelist-5f07f' permission denied. សូមពិនិត្យ Security Rules របស់ 'brakelist-5f07f' ឲ្យអនុញ្ញាតលុប (write) path '/attendance'។");
      }
    }
  };

  
  // ... (handleSearchChange មិនផ្លាស់ប្តូរ) ...
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const matchingStudent = students.find(
      (student) => 
        (student.name && student.name.toLowerCase() === value.toLowerCase()) ||
        (student.idNumber && student.idNumber === value)
    );
    
    if (matchingStudent) {
      setSelectedStudentId(matchingStudent.id);
    } else {
      setSelectedStudentId("");
    }
  };

  // --- ផ្នែកបង្ហាញ (Render) ---

  // Component សម្រាប់ Card ធំ (!! កែសម្រួល !!)
  const StudentCard = ({ student, pageKey, elapsedMins, isOvertime }) => {
    const record = attendance[student.id]; 

    let statusText = 'មិនទាន់សម្រាក';
    let statusClass = 'bg-gray-500 text-white'; 
    let canCheckIn = false; 
    let canCheckOut = true;

    if (record) {
      if (record.checkOutTime && !record.checkInTime) {
        statusText = `កំពុងសម្រាក (${elapsedMins} នាទី)`; 
        statusClass = isOvertime 
          ? 'bg-red-600 text-white animate-pulse' 
          : 'bg-yellow-500 text-white animate-pulse';
        canCheckIn = true; 
        canCheckOut = false; 
      } else if (record.checkOutTime && record.checkInTime) {
        const duration = calculateDuration(record.checkOutTime, record.checkInTime);
        statusText = `សម្រាករួច (${duration} នាទី)`; 
        statusClass = 'bg-green-600 text-white'; 
        canCheckIn = false;
        canCheckOut = false;
      }
    }
    const photoUrl =
      student.photoUrl ||
      `https://placehold.co/128x128/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;

    return (
      <div
        key={`${pageKey}-${student.id}`} 
        className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-6 relative mt-16 max-w-md mx-auto"
      >
        {/* !! ថ្មី !!: ប៊ូតុងលុប (សម្រាប់ Modal ពេលកំពុងសម្រាក) */}
        {record && record.checkOutTime && !record.checkInTime && (
          <button
            onClick={(e) => handleDelete(e, student.id)}
            className="absolute top-4 right-4 text-red-300 bg-red-900/50 p-2 rounded-full transition-all hover:bg-red-500 hover:text-white"
            title="លុបទិន្នន័យនេះ"
          >
            <IconTrash />
          </button>
        )}
        
        <img
          src={photoUrl}
          alt={`រូបថតរបស់ ${student.name || 'និស្សិត'}`}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
          onError={(e) => {
            e.target.src = `https://placehold.co/128x128/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;
          }}
        />
        
        <div className="pt-16 text-center">
          <p className="text-3xl font-bold text-white">
            {student.name || 'គ្មានឈ្មោះ'}
          </p>
          <p className="text-lg text-blue-200">
            អត្តលេខ: {student.idNumber || 'N/A'}
          </p>
          <p className="text-lg text-blue-200">
            ថ្នាក់: {student.class || 'N/A'}
          </p>
        </div>
        
        <div className="my-6 text-center">
           <p className={`inline-block px-5 py-2 rounded-full text-md font-semibold ${statusClass}`}>
            {statusText}
          </p>
        </div>

        {/* !! កែសម្រួល !!: លាក់ប៊ូតុង "ចេញ" ប្រសិនបើ 'canCheckOut' = false */}
        {(canCheckOut || canCheckIn) && (
          <div className="flex flex-col space-y-3">
            {canCheckOut && (
              <button
                onClick={() => handleCheckOut(student.id)}
                disabled={!canCheckOut}
                className="flex items-center justify-center w-full px-4 py-4 rounded-full text-lg text-white font-bold transition-all transform hover:scale-105 shadow-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                <IconCheckOut />
                ចេញសម្រាក
              </button>
            )}
            
            {canCheckIn && (
              <button
                onClick={() => handleCheckIn(student.id)}
                disabled={!canCheckIn}
                className="flex items-center justify-center w-full px-4 py-4 rounded-full text-lg text-blue-800 font-bold transition-all transform hover:scale-105 shadow-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                <IconCheckIn />
                ចូលវិញ
              </button>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Component សម្រាប់ List Card "បានចូល"
  // ... (មិនផ្លាស់ប្តូរ) ...
  const CompletedStudentListCard = ({ student, onClick }) => {
    const record = attendance[student.id];
    
    const formatTime = (isoString) => {
      if (!isoString) return 'N/A';
      return new Date(isoString).toLocaleTimeString('km-KH', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // !! ថ្មី !!: គណនារយៈពេលសរុប
    const duration = calculateDuration(record?.checkOutTime, record?.checkInTime);

    const photoUrl =
      student.photoUrl ||
      `https://placehold.co/64x64/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;

    return (
      <button
        onClick={onClick}
        className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-4 mb-3 flex items-center space-x-4 transition-all hover:bg-white/20"
      >
        <img
          src={photoUrl}
          alt={`រូបថតរបស់ ${student.name || 'និស្សិត'}`}
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
          onError={(e) => {
            e.target.src = `https://placehold.co/64x64/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;
          }}
        />
        <div className="flex-1 text-left">
          <p className="text-xl font-bold text-white">
            {student.name || 'គ្មានឈ្មោះ'}
          </p>
          <p className="text-sm text-blue-200">
            ចេញ: {formatTime(record?.checkOutTime)} | ចូល: {formatTime(record?.checkInTime)}
          </p>
        </div>
        
        {/* !! ថ្មី !!: បង្ហាញរយៈពេលសរុប */}
        <div className="text-center px-2">
          <p className="text-2xl font-bold text-green-300">{duration}</p>
          <p className="text-xs text-blue-200">នាទី</p>
        </div>
      </button>
    );
  };
  
  // !! កែសម្រួល !!: Component សម្រាប់ List Card "កំពុងសម្រាក"
  const OnBreakStudentListCard = ({ student, elapsedMins, isOvertime, onCheckIn, onDelete }) => {
    
    // ស្ថានភាពពណ៌
    const cardColor = isOvertime 
      ? 'bg-red-800/30 backdrop-blur-lg border border-red-500/30' // លើសម៉ោង
      : 'bg-yellow-500/20 backdrop-blur-lg border border-yellow-500/30'; // កំពុងសម្រាក
    
    const textColor = isOvertime ? 'text-red-300' : 'text-yellow-300';

    const photoUrl =
      student.photoUrl ||
      `https://placehold.co/64x64/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`;

    return (
      <div className={`w-full max-w-md mx-auto rounded-2xl shadow-lg p-4 mb-3 flex items-center space-x-3 ${cardColor}`}>
        {/* ផ្នែកព័ត៌មាន */}
        <img
          src={photoUrl}
          alt={`រូបថតរបស់ ${student.name || 'និស្សិត'}`}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/50 shadow-md"
          onError={(e) => { e.target.src = `https://placehold.co/64x64/EBF4FF/76A9FA?text=${student.name ? student.name.charAt(0) : 'N'}`; }}
        />
        <div className="flex-1 text-left">
          <p className="text-xl font-bold text-white">
            {student.name || 'គ្មានឈ្មោះ'}
          </p>
          <p className={`text-sm font-semibold ${textColor}`}>
            {isOvertime ? "លើសម៉ោង!" : "កំពុងសម្រាក..."}
          </p>
        </div>
        
        <div className="text-center px-2">
          <p className={`text-2xl font-bold ${textColor}`}>{elapsedMins}</p>
          <p className="text-xs text-blue-200">នាទី</p>
        </div>
        
        {/* !! ថ្មី !!: ផ្នែកប៊ូតុង */}
        <div className="flex flex-col space-y-2">
          {/* ប៊ូតុងចូល (Icon) */}
          <button
            onClick={() => onCheckIn()}
            className="p-3 rounded-full text-blue-800 bg-white transition-colors hover:bg-gray-200"
            title="ចុចចូលវិញ"
          >
            <IconCheckIn />
          </button>
          
          {/* ប៊ូតុងលុប (Icon) */}
          <button
            onClick={(e) => onDelete(e)}
            className="p-3 rounded-full text-red-300 bg-white/10 transition-colors hover:bg-red-500 hover:text-white"
            title="លុបទិន្នន័យនេះ"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    );
  };
  

  // Component សម្រាប់ Loading
  // ... (មិនផ្លាស់ប្តូរ) ...
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center mt-10">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  // --- ត្រង (Filter) និង រៀបចំ (Sort) និស្សិត ---
  
  // ត្រង (Filter) និស្សិតដែលកំពុងសម្រាក (សម្រាប់ Tab Count)
  const studentsOnBreak = students.filter(student => {
// ... (មិនផ្លាស់ប្តូរ) ...
    const record = attendance[student.id];
    return record && record.checkOutTime && !record.checkInTime;
  });
  
  // !! ថ្មី !!: ត្រង (Filter), គណនា (Map), និង រៀបលំដាប់ (Sort) និស្សិតកំពុងសម្រាក
  const sortedStudentsOnBreak = studentsOnBreak
    .map(student => {
// ... (មិនផ្លាស់ប្តូរ) ...
      const record = attendance[student.id];
      // គណនាដោយប្រើ 'now' ពី State
      const elapsedMins = calculateDuration(record.checkOutTime, now.toISOString()); 
      const isOvertime = elapsedMins > 15; // កំណត់ 15 នាទី
      return { student, elapsedMins, isOvertime };
    })
    .sort((a, b) => {
// ... (មិនផ្លាស់ប្តូរ) ...
      // Sort តាម isOvertime (true មកមុន)
      if (a.isOvertime !== b.isOvertime) {
        return a.isOvertime ? -1 : 1;
      }
      // បើដូចគ្នា Sort តាមអ្នកសម្រាកយូរជាងគេ
      return b.elapsedMins - a.elapsedMins;
    });


  // ត្រង (Filter) និស្សិតដែលបានសម្រាករួច
  const studentsCompletedBreak = students.filter(student => {
// ... (មិនផ្លាស់ប្តូរ) ...
    const record = attendance[student.id];
    return record && record.checkOutTime && record.checkInTime;
  });
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Component គោល
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;700&display=swap');
          
          body, .font-kantumruy {
            font-family: 'Kantumruy Pro', sans-serif;
          }
        `}
      </style>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-700 font-kantumruy p-4">
        <div className="container mx-auto max-w-lg">
          {/* --- 1. HEADER (រួម) --- */}
          {/* ... (មិនផ្លាស់ប្តូរ) ... */}
          <h1 
            className="text-4xl font-bold text-center mb-2 text-white"
          >
            កត់ត្រាម៉ោងសម្រាក
          </h1>
          <p 
            className="text-xl text-center mb-6 text-blue-200"
          >
            {displayDate}
          </p>

          {/* --- 2. TABS (!! កែសម្រួល !!) --- */}
          <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-full p-1 flex space-x-1 mb-6">
            
            {/* Tab 1: ស្វែងរក */}
            <button
              onClick={() => setCurrentPage('search')}
              // !! កែ !!: ដកអក្សរ, ប្តូរទំហំ
              className={`w-1/3 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'search' 
                  ? 'bg-white text-blue-800 shadow-lg' 
                  : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <IconSearch />
              </span>
            </button>
            
            {/* Tab 2: កំពុងសម្រាក */}
            <button
              onClick={() => setCurrentPage('onBreak')}
              // !! កែ !!: ដកអក្សរ, ប្តូរទំហំ
              className={`w-1/3 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'onBreak' 
                  ? 'bg-white text-blue-800 shadow-lg' 
                  : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <IconClock />
                {studentsOnBreak.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {studentsOnBreak.length}
                  </span>
                )}
              </span>
            </button>
            
            {/* Tab 3: បានចូល */}
            <button
              onClick={() => setCurrentPage('completed')}
              // !! កែ !!: ដកអក្សរ, ប្តូរទំហំ
              className={`w-1/3 px-2 py-3 rounded-full flex items-center justify-center transition-colors relative ${
                currentPage === 'completed' 
                  ? 'bg-white text-blue-800 shadow-lg' 
                  : 'text-white'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <IconCheckCircle />
                {studentsCompletedBreak.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {studentsCompletedBreak.length}
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* --- 3. ផ្នែក CONTENT --- */}
          
          {loading && <LoadingSpinner />}

          {authError && (
            <div className="mt-16 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-md mx-auto" role="alert">
              <strong className="font-bold">បញ្ហា Firebase!</strong>
              <span className="block sm:inline ml-2">{authError}</span>
            </div>
          )}
            
          {/* --- PAGE 1: ស្វែងរក --- */}
          {/* ... (មិនផ្លាស់ប្តូរ) ... */}
          {!loading && currentPage === 'search' && (
            <div 
              key="search-page"
            >
              <div className="mb-8 w-full max-w-md mx-auto">
                {students.length > 0 ? (
                  <div>
                    <label htmlFor="student-search" className="block text-sm font-medium text-blue-100 mb-2 text-center">
                      វាយឈ្មោះ ឬ អត្តលេខនិស្សិត:
                    </label>
                    <input
                      type="text"
                      id="student-search"
                      list="student-list"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="-- ស្វែងរកនៅទីនេះ --"
                      className="block w-full px-6 py-4 bg-white/20 border border-white/30 rounded-full text-white text-lg placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white shadow-inner"
                    />
                    <datalist id="student-list">
                      {students.map((student) => (
                        <option key={student.id} value={student.name}>
                          {student.idNumber}
                        </option>
                      ))}
                    </datalist>
                  </div>
                ) : (
                  !authError && (
                    <div className="flex flex-col justify-center items-center mt-4">
                      <p className="text-gray-300 text-lg">
                        មិនមានទិន្នន័យនិស្សិត...
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        (កំពុងព្យាយាមទាញពី `dilistname`...)
                      </p>
                    </div>
                  )
                )}
              </div>
              
              {selectedStudent && (
                <StudentCard 
                  student={selectedStudent} 
                  pageKey="search"
                  elapsedMins={0} 
                  isOvertime={false} 
                />
              )}
              {!selectedStudent && searchTerm !== "" && (
                <p className="text-center text-white/70 text-lg mt-10">
                  រកមិនឃើញនិស្សិត...
                </p>
              )}
            </div>
          )}

          {/* --- PAGE 2: កំពុងសម្រាក (!! កែសម្រួល !!) --- */}
          {!loading && currentPage === 'onBreak' && (
            <div 
              key="on-break-page"
              className="pb-10"
            >
              {/* !! ថ្មី !!: ប្រើ `sortedStudentsOnBreak` និង Card ថ្មី */}
              {sortedStudentsOnBreak.length > 0 ? (
                sortedStudentsOnBreak.map(({ student, elapsedMins, isOvertime }) => (
                  <OnBreakStudentListCard 
                    key={student.id} 
                    student={student} 
                    elapsedMins={elapsedMins} 
                    isOvertime={isOvertime}
                    onCheckIn={() => handleCheckIn(student.id)} // បញ្ជូនមុខងារ CheckIn
                    onDelete={(e) => handleDelete(e, student.id)} // បញ្ជូនមុខងារលុប
                  />
                ))
              ) : (
                <div className="mt-16 text-center">
                  <p className="text-white text-2xl font-semibold">
                    មិនមាននិស្សិតកំពុងសម្រាកទេ
                  </p>
                  <p className="text-blue-200 text-lg">
                    ទំព័រនេះនឹងបង្ហាញនិស្សិតដែលបានចុច "ចេញសម្រាក"។
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* --- PAGE 3: បានចូល --- */}
          {/* ... (មិនផ្លាស់ប្តូរ) ... */}
          {!loading && currentPage === 'completed' && (
            <div 
              key="completed-page"
              className="pb-10"
            >
              {studentsCompletedBreak.length > 0 ? (
                // ប្តូរទៅប្រើ Component ថ្មី
                studentsCompletedBreak.map(student => (
                  <CompletedStudentListCard 
                    key={student.id} 
                    student={student}
                    onClick={() => setModalStudent(student)} // ចុចដើម្បីបើក Modal
                  />
                ))
              ) : (
                <div className="mt-16 text-center">
                  <p className="text-white text-2xl font-semibold">
                    មិនមាននិស្សិតសម្រាករួចទេ
                  </p>
                  <p className="text-blue-200 text-lg">
                    ទំព័រនេះនឹងបង្ហាញនិស្សិតដែលបាន "ចូលវិញ"។
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* --- FOOTER (រួម) --- */}
          {/* ... (មិនផ្លាស់ប្តូរ) ... */}
          {!loading && userId && (
             <p className="text-center text-xs text-blue-300 opacity-70 mt-8">
               UserID (brakelist): {userId}
             </p>
          )}
        </div>
        
        {/* --- MODAL (POP-UP) --- */}
        {/* !! កែ !!: ឥឡូវ Modal នេះប្រើសម្រាប់តែ Page "បានចូល" */}
        {modalStudent && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setModalStudent(null)} 
          >
            <div
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()} 
            >
              <StudentCard 
                student={modalStudent} 
                pageKey="modal"
                elapsedMins={
                  calculateDuration(attendance[modalStudent.id]?.checkOutTime, now.toISOString())
                }
                isOvertime={
                  calculateDuration(attendance[modalStudent.id]?.checkOutTime, now.toISOString()) > 15
                }
              />
              
              {/* ប៊ូតុងបិទ */}
              <button 
                onClick={() => setModalStudent(null)}
                className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full transition-all hover:bg-white/30"
              >
                <IconClose />
              </button>
            </div>
          </div>
        )}
        
      </div>
    </>
  );
}

