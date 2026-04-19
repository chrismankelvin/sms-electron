// src/routes/index.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedLayout from "./layouts/RoleBasedLayout";
import ActivationStatus from "./pages/Activation/ActivationStatus";
import ActivationPage from "./pages/Activation/ActivationPage";
import SchoolAndAdminSetupPage from "./SchoolDetails/SchoolDetailsPage";
import AdminDetailsPage from "./SchoolDetails/AdminDetailsPage";
import SchoolLogin from "./pages/Login/SchoolLogin";
import Dashboard from "./pages/Dashboard/Dashboard";
import SchoolProfile from "./pages/Adminpages/school-setup/profile";
import AcademicYears from "./pages/Adminpages/school-setup/AcademicYears";

import Settings from "./pages/Settings/Settings";
import MiniSettingsPage from "./pages/Settings/MiniSettingsPage";
import RecoverAccountPage from "./SchoolDetails/RecoverAccountPage";
import Unauthorized from "./pages/Unauthorized";
import 'bootstrap/dist/css/bootstrap.min.css';
import Accountant from "./pages/Accountant/Accountant";

// Import your pages
import ViewTeachers from "./pages/Adminpages/View/ViewTeachers";
import ViewStudent from "./pages/Adminpages/View/ViewStudents";
import TeacherRegistration from "./pages/Adminpages/Registration/TeacherRegistration";
import StudentRegistration from "./pages/Adminpages/Registration/StudentRegistration";
import TeachingAssistantRegistration from "./pages/Adminpages/Registration/TeachingAssistantRegistration";
import NonStaffRegistration from "./pages/Adminpages/Registration/NonStaffRegistration";
import AdministratorRegistration from "./pages/Adminpages/Registration/AdministratorRegistration";

// Import API services
import {
  checkActivationStatus,
  getDatabaseStatus,
  isElectron
} from "./services/api.service";

import { miniSettingsService } from "./services/miniSettingsService";
import AccountantRegistration from "./pages/Adminpages/Registration/AccountantRegistration";
import Levels from "./pages/Adminpages/school-setup/Levels";
import Programmes from "./pages/Adminpages/school-setup/Programmes";
import GradeBoundaries from "./pages/Adminpages/school-setup/GradeBoundaries";
import AssessmentTypes from "./pages/Adminpages/school-setup/AssessmentTypes";
import Terms from "./pages/Adminpages/school-setup/Terms";
import Classes from "./pages/Adminpages/academic-structure/Classes";
import Sections from "./pages/Adminpages/academic-structure/Sections";
import Subjects from "./pages/Adminpages/academic-structure/Subjects";
import LevelCoreSubjects from "./pages/Adminpages/academic-structure/LevelCoreSubjects";
import ProgrammeSubjects from "./pages/Adminpages/academic-structure/ProgrammeSubject";
import TeacherQualifications from "./pages/Adminpages/academic-structure/TeacherQualifications";
import Staff from "./pages/Adminpages/people-management/Staff";
import NonStaff from "./pages/Adminpages/people-management/NonStaff";
import Students from "./pages/Adminpages/people-management/Students";
import TeachingAssistants from "./pages/Adminpages/people-management/TeachingAssitants";
import Parents from "./pages/Adminpages/people-management/Parents";
import PersonDirectory from "./pages/Adminpages/people-management/PersonDirectory";
import WorkloadAnalysis from "./pages/Adminpages/teacher-assignment/WorkloadAnalysis";
import AssignFormMasters from "./pages/Adminpages/teacher-assignment/AssignFormMasters";
import AssignSubjects from "./pages/Adminpages/teacher-assignment/AssignSubjects";
import CopyTimetable from "./pages/Adminpages/Timetable/CopyTimetable";
import Rooms from "./pages/Adminpages/Timetable/Rooms";
import TimeSlots from "./pages/Adminpages/Timetable/TimeSlots";
import TimetableBuilder from  "./pages/Adminpages/Timetable/TimetableBuilder";
import ViewTimetable from "./pages/Adminpages/Timetable/ViewTimetable";
import WeekDays from "./pages/Adminpages/Timetable/WeekDays";
import Assessments from "./pages/Adminpages/Assessment/Assessments";
import BulkImport from "./pages/Adminpages/Assessment/BulkImport";
import GradeAnalysis from "./pages/Adminpages/Assessment/GradeAnalysis";
import ProcessResults from "./pages/Adminpages/Assessment/ProcessResults";
import ReportCards from "./pages/Adminpages/Assessment/ReportCards";
import ScoreEntry from "./pages/Adminpages/Assessment/ScoreEntry";
import SubjectResults from "./pages/Adminpages/Assessment/SubjectResults";
import TermResults from "./pages/Adminpages/Assessment/TermResults";
import Transcripts from "./pages/Adminpages/Assessment/Transcripts";
import MarkAttendance from "./pages/Adminpages/Attendance/MarkAttendance";
import AttendanceReports from "./pages/Adminpages/Attendance/AttendanceReports";
import AbsenteeismAlerts from "./pages/Adminpages/Attendance/AbsenteeismAlerts";
import HolidaySetup from "./pages/Adminpages/Attendance/HolidaySetup";
import PromotionRules from "./pages/Adminpages/Progression/PromotionRules";
import BatchPromotion from "./pages/Adminpages/Progression/BatchPromotion";
import ManualPromotion from "./pages/Adminpages/Progression/ManualPromotion";
import Graduation from "./pages/Adminpages/Progression/Graduation";
import StudentHistory from "./pages/Adminpages/Progression/StudentHistory";
import ClassTransfers from "./pages/Adminpages/Progression/ClassTransfers";
import EmailQueue from "./pages/Adminpages/Communication/EmailQueue";
import NotificationHistory from "./pages/Adminpages/Communication/NotificationHistory";
import SendNotification from "./pages/Adminpages/Communication/SendNotification";
import SmsQueue from "./pages/Adminpages/Communication/SmsQueue";
import Templates from "./pages/Adminpages/Communication/Templates";
import UserPrefferences from "./pages/Adminpages/Communication/UserPreferences";
import AcademicReports from "./pages/Adminpages/Reports/AcademicReports";
import EnrollmentTrends  from "./pages/Adminpages/Reports/EnrollmentTrends";
import ExportCenter from "./pages/Adminpages/Reports/ExportCenter";
import StaffReports from "./pages/Adminpages/Reports/StaffReports";
import StudentReports from "./pages/Adminpages/Reports/StaffReports";
import PerformanceAnalytics  from "./pages/Adminpages/Reports/PerformanceAnalytics";
import AuditLogs from "./pages/Adminpages/DataManagement/AuditLogs";
import BackupRestore from "./pages/Adminpages/DataManagement/BackupRestore";
import ExportData from  "./pages/Adminpages/DataManagement/ExportData";
import ImportData from "./pages/Adminpages/DataManagement/ImportData";
import Migrations from "./pages/Adminpages/DataManagement/Migrations";
import GlobalSettings from "./pages/Adminpages/SystemAdmin/GlobalSettings";
import LicenseManagement from "./pages/Adminpages/SystemAdmin/LicenseManagement";
import RolesPermissions from "./pages/Adminpages/SystemAdmin/RolesPermissions";
import SystemHealth from "./pages/Adminpages/SystemAdmin/SystemHealth";
import SystemLogs from "./pages/Adminpages/SystemAdmin/SystemLogs";
import UserManagement from "./pages/Adminpages/SystemAdmin/UserManagement";
// import from "./pages/Adminpages";


function AppRoutes({ activated, setActivated }) {
  const [setupStatus, setSetupStatus] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasSeenMiniSettings, setHasSeenMiniSettings] = useState(false);
  const [checkingMiniSettings, setCheckingMiniSettings] = useState(true);

  useEffect(() => {
    if (activated) {
      checkMiniSettingsStatus();
    }
    checkStatus();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activated]);

  const checkMiniSettingsStatus = async () => {
    try {
      const hasSeen = await miniSettingsService.hasSeenMiniSettings();
      setHasSeenMiniSettings(hasSeen);
    } catch (error) {
      console.error("Failed to check mini settings:", error);
      const seenSettings = localStorage.getItem("hasSeenMiniSettings");
      setHasSeenMiniSettings(seenSettings === "true");
    } finally {
      setCheckingMiniSettings(false);
    }
  };

  const handleMiniSettingsComplete = async () => {
    try {
      await miniSettingsService.setSeenMiniSettings();
      setHasSeenMiniSettings(true);
    } catch (error) {
      console.error("Failed to save mini settings:", error);
      localStorage.setItem("hasSeenMiniSettings", "true");
      setHasSeenMiniSettings(true);
    }
  };

  const checkStatus = async () => {
    try {
      console.log('🔍 Checking activation status...');

      // Use the API service to check activation
      const isActivated = await checkActivationStatus();
      console.log('✅ Activation status:', isActivated);
      setActivated(isActivated.activated);

      // ALWAYS check database status, even if activated
      // This ensures we have the latest setup status
      try {
        console.log('🔍 Checking database status...');
        const dbStatus = await getDatabaseStatus();

        console.log('✅ Database status:', dbStatus);

        const newSetupStatus = {
          school_completed: dbStatus?.school_completed || false,
          admin_completed: dbStatus?.admin_completed || false,
          activation_completed: isActivated.activated,
        };

        console.log('📊 Setting setup status to:', newSetupStatus);
        setSetupStatus(newSetupStatus);

      } catch (dbError) {
        console.error('❌ Failed to get database status:', dbError);
        // Fallback to default values
        setSetupStatus({
          school_completed: false,
          admin_completed: false,
          activation_completed: isActivated,
        });
      }
    } catch (error) {
      console.error("❌ Failed to check status via IPC:", error);

      // In browser mode, set defaults
      if (!isElectron()) {
        console.log('🌐 Browser mode: using default setup status');
        setSetupStatus({
          school_completed: false,
          admin_completed: false,
          activation_completed: false,
        });
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  if (checkingStatus || checkingMiniSettings) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {!isElectron() && (
            <p className="mt-3 text-muted">Browser mode - some features may be limited</p>
          )}
        </div>
      </div>
    );
  }

  if (!activated) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <SetupFlow
              setupStatus={setupStatus}
              isOnline={isOnline}
              onActivated={() => {
                setActivated(true);
                const checkMini = async () => {
                  const hasSeen = await miniSettingsService.hasSeenMiniSettings();
                  if (!hasSeen) setHasSeenMiniSettings(false);
                };
                checkMini();
              }}
              onStatusUpdate={checkStatus}
            />
          }
        />
        <Route path="/status" element={<ActivationStatus />} />
        <Route path="/recover-account" element={<RecoverAccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const showMiniSettings = activated && !hasSeenMiniSettings;

  // PROTECTED ROUTES WITH ROLE-BASED LAYOUT
  return (
    <Routes>
      {showMiniSettings ? (
        <Route path="/" element={<MiniSettingsPage onComplete={handleMiniSettingsComplete} />} />
      ) : (
        <Route path="/" element={<SchoolLogin />} />
      )}

      <Route path="/home" element={<SchoolLogin />} />

      {/* Dashboard - Accessible by all authenticated users */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Dashboard />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school-setup/profile"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <SchoolProfile />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school-setup/academic-years"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <AcademicYears />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school-setup/levels"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Levels />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school-setup/programmes"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Programmes />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school-setup/grade-boundaries"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <GradeBoundaries />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school-setup/assessment-types"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <AssessmentTypes />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/school-setup/terms"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Terms />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/academic/classes"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Classes />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/academic/sections"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Sections />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/academic/subjects"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Subjects />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/academic/level-core-subjects"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <LevelCoreSubjects />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/academic/programme-subjects"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ProgrammeSubjects />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/academic/teacher-qualifications"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <TeacherQualifications />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/people/staff"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Staff />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/people/non-staff"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <NonStaff />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/people/Students"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Students />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/people/teaching-assistants"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <TeachingAssistants />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/people/parents"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Parents />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/people/directory"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <PersonDirectory />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/timetable/time-slots"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <TimeSlots />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/timetable/week-days"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <WeekDays />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/timetable/rooms"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Rooms />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/timetable/builder"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <TimetableBuilder />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/timetable/view"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ViewTimetable />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/timetable/copy"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <CopyTimetable />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher-assignments/subjects"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <AssignSubjects />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher-assignments/workload"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <WorkloadAnalysis />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher-assignments/form-masters"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <AssignFormMasters />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

       <Route
        path="/assessment/assessments"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Assessments />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/assessment/score-entry"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ScoreEntry />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/assessment/bulk-import"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <BulkImport />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/assessment/process-results"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ProcessResults />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/assessment/Subject-results"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <SubjectResults />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/assessment/term-results"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <TermResults />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/assessment/report-cards"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ReportCards />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/assessment/transcripts"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Transcripts />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/assessment/grade-analysis"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <GradeAnalysis />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/attendance/mark"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <MarkAttendance />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/attendance/reports"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <AttendanceReports />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/attendance/alerts"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <AbsenteeismAlerts />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/attendance/holidays"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <HolidaySetup />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/progression/rules"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <PromotionRules />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/progression/batch-promotion"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <BatchPromotion />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/progression/manual"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ManualPromotion />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/progression/graduation"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Graduation />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/progression/student-history"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <StudentHistory />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/progression/transfers"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ClassTransfers />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
       <Route
        path="/communication/send"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <SendNotification />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/communication/email-queue"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <EmailQueue />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/communication/sms-queue"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <SmsQueue />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/communication/templates"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Templates />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/communication/preferences"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <UserPrefferences />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/communication/history"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <NotificationHistory />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/reports/students"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <StudentReports />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports/staff"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <StaffReports />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports/academic"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <AcademicReports />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports/performance"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <PerformanceAnalytics />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports/enrollment"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <EnrollmentTrends />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports/export"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ExportCenter />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
          <Route
        path="/data/export"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ExportData />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
          <Route
        path="/data/import"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <ImportData />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
         <Route
        path="/data/migrations"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <Migrations />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />   <Route
        path="/data/audit-logs"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <AuditLogs />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
         <Route
        path="/data/backup"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <BackupRestore />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
         <Route
        path="/system/users"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <UserManagement />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/system/roles"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <RolesPermissions />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/system/logs"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <SystemLogs />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/system/license"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <LicenseManagement />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/system/settings"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <GlobalSettings />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
        <Route
        path="/system/health"
        element={
          <PrivateRoute allowedRoles={["administrator", "staff", "teacher", "student", "teaching_assistant", "non_teaching_staff"]}>
            <RoleBasedLayout>
              <SystemHealth />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      
      
      







      {/* Students Routes */}
      <Route
        path="/students"
        element={
          <PrivateRoute allowedRoles={["administrator", "teacher"]}>
            <RoleBasedLayout>
              <Students />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <PrivateRoute allowedRoles={["administrator", "Staff"]}>
            <RoleBasedLayout>
              <Staff />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      {/* Settings Routes */}
      <Route
        path="/settings"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <RoleBasedLayout>
              <Settings />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/accountant"
        element={
          <PrivateRoute allowedRoles={["accountant", "administrator"]}>
            <RoleBasedLayout>
              <Accountant />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      {/* View Section Routes */}
      <Route
        path="/view/teachers"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <RoleBasedLayout>
              <ViewTeachers />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/view/students"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <RoleBasedLayout>
              <ViewStudent />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      {/* Registration Section Routes */}
      <Route
        path="/registration/teachers"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <RoleBasedLayout>
              <TeacherRegistration />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/registration/accountant"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <RoleBasedLayout>
              <AccountantRegistration />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/registration/students"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <RoleBasedLayout>
              <StudentRegistration />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/registration/teaching-assistants"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <RoleBasedLayout>
              <TeachingAssistantRegistration />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/registration/non-staff"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <RoleBasedLayout>
              <NonStaffRegistration />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/registration/administrators"
        element={
          <PrivateRoute allowedRoles={["administrator"]}>
            <RoleBasedLayout>
              <AdministratorRegistration />
            </RoleBasedLayout>
          </PrivateRoute>
        }
      />

      {/* Unauthorized Page */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Catch all - redirect based on auth */}
      <Route path="*" element={<Navigate to={showMiniSettings ? "/" : "/home"} replace />} />
    </Routes>
  );
}

// -----------------------
// SETUP FLOW COMPONENT - FIXED VERSION
// -----------------------
function SetupFlow({ setupStatus, isOnline, onActivated, onStatusUpdate }) {
  const [currentStep, setCurrentStep] = useState("checking");
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState(null);

  // Log setupStatus changes for debugging
  useEffect(() => {
    console.log('🔄 SetupFlow received setupStatus:', setupStatus);
  }, [setupStatus]);

  // Determine current step based on setupStatus
  useEffect(() => {
    // Only update step if we're not in the middle of a navigation
    if (!isNavigating && setupStatus) {
      console.log('🔄 SetupFlow useEffect - setupStatus:', setupStatus);
      console.log('🔄 SetupFlow useEffect - isOnline:', isOnline);

      if (!isOnline) {
        console.log('📱 Device is offline');
        setCurrentStep("offline");
      } else if (!setupStatus.school_completed) {
        console.log('🏫 School not completed, showing school step');
        setCurrentStep("school");
      } else if (!setupStatus.admin_completed) {
        console.log('👤 Admin not completed, showing admin step');
        setCurrentStep("admin");
      } else if (!setupStatus.activation_completed) {
        console.log('🔑 Activation not completed, showing activation step');
        setCurrentStep("activation");
      } else {
        console.log('✅ All steps completed');
        setCurrentStep("completed");
      }
    }
  }, [setupStatus, isOnline, isNavigating]);

  const handleSchoolSuccess = async () => {
    console.log('🎉 School completed successfully');
    setIsNavigating(true);
    setError(null);

    try {
      // Call status update and wait for it
      console.log('🔄 Refreshing status after school completion...');
      await onStatusUpdate();
      console.log('✅ Status refreshed, moving to admin step');

      // Manually set to admin step
      setCurrentStep("admin");
    } catch (err) {
      console.error('❌ Error after school completion:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleAdminSuccess = async () => {
    console.log('🎉 Admin completed successfully');
    setIsNavigating(true);
    setError(null);

    try {
      // Call status update and wait for it
      console.log('🔄 Refreshing status after admin completion...');
      await onStatusUpdate();
      console.log('✅ Status refreshed, moving to activation step');

      // Manually set to activation step
      setCurrentStep("activation");
    } catch (err) {
      console.error('❌ Error after admin completion:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleActivationSuccess = async () => {
    console.log('🎉 Activation completed successfully');
    setIsNavigating(true);
    setError(null);

    try {
      await onActivated();
      console.log('✅ Activation processed, redirecting...');
      // Let the main AppRoutes handle the redirect
    } catch (err) {
      console.error('❌ Error during activation:', err);
      setError('Failed to process activation. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleBack = (fromStep) => {
    console.log(`⬅️ Going back from ${fromStep}`);
    if (fromStep === 'admin') {
      setCurrentStep('school');
    } else if (fromStep === 'activation') {
      setCurrentStep('admin');
    }
  };

  // Show error if any
  if (error) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow-lg" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center p-5">
            <h3 className="mb-3 text-danger">Error</h3>
            <p className="text-muted mb-4">{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setError(null);
                onStatusUpdate();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "offline") {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow-lg" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center p-5">
            <h3 className="mb-3 text-danger">Internet Required</h3>
            <p className="text-muted">
              Please connect to the internet to complete the setup process.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "checking") {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p>Checking setup status...</p>
        </div>
      </div>
    );
  }

  // Show loading during navigation
  if (isNavigating) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p>Loading next step...</p>
        </div>
      </div>
    );
  }

  switch (currentStep) {
    case "school":
      console.log('🏫 Rendering SchoolAndAdminSetupPage');
      return (
        <SchoolAndAdminSetupPage
          onSuccess={handleSchoolSuccess}
          isOnline={isOnline}
        />
      );

    case "admin":
      console.log('👤 Rendering AdminDetailsPage');
      return (
        <AdminDetailsPage
          onSuccess={handleAdminSuccess}
          onBack={() => handleBack('admin')}
          isOnline={isOnline}
        />
      );

    case "activation":
      console.log('🔑 Rendering ActivationPage');
      return (
        <ActivationPage
          onActivated={handleActivationSuccess}
          onBack={() => handleBack('activation')}
          isOnline={isOnline}
        />
      );

    case "completed":
      console.log('✅ Setup completed, redirecting...');
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p>Setup complete! Redirecting...</p>
          </div>
        </div>
      );

    default:
      console.log('❌ Unknown step:', currentStep);
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <p className="text-danger">Setup error occurred. Please refresh the page.</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
  }
}

export default AppRoutes;