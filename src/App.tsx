import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import { AppProvider, useAppContext } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Login } from './pages/auth/Login';
import { Box, Typography } from '@mui/material';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { CertificateVerification } from './pages/client/CertificateVerification';
import { VerificationHistory } from './pages/client/VerificationHistory';
import { BulkVerification } from './pages/client/BulkVerification';
import { CertificateRenewal } from './pages/client/CertificateRenewal';
import { ServiceHistory } from './pages/client/ServiceHistory';
import { NewServiceRequest } from './pages/client/NewServiceRequest';
import { ProfileManagement } from './pages/client/ProfileManagement';
import { PaymentMethods } from './pages/client/PaymentMethods';
import { PaymentProcessing } from './pages/client/PaymentProcessing';
import { PaymentHistory } from './pages/client/PaymentHistory';
import { ReceiptDetail } from './pages/client/ReceiptDetail';
import { Settings } from './pages/client/Settings';
import { CommunicationPreferences } from './pages/client/CommunicationPreferences';
import { ContactSupport } from './pages/client/ContactSupport';
import { SupportTickets } from './pages/client/SupportTickets';
import { LegalInformation } from './pages/client/LegalInformation';
import { PrivacyPolicy } from './pages/client/PrivacyPolicy';
import { Notifications } from './pages/common/Notifications';
import { CPDLibrary } from './pages/client/CPDLibrary';
import { MyCertificates } from './pages/client/MyCertificates';
import { DocumentManagement } from './pages/client/DocumentManagement';
import { CPDCategoryDetail } from './pages/client/CPDCategoryDetail';
import { CPDVideoPlayer } from './pages/client/CPDVideoPlayer';
import { CPDQuiz } from './pages/client/CPDQuiz';
import { CPDExercise } from './pages/client/CPDExercise';

// Inspector Pages
import { InspectorDashboard } from './pages/inspector/InspectorDashboard';
import { JobOrderDetail } from './pages/inspector/JobOrderDetail';
import { JobOrdersList } from './pages/inspector/JobOrdersList';
import { NewJobOrder } from './pages/inspector/NewJobOrder';
import { StickerStock } from './pages/inspector/StickerStock';
import { InspectorSchedule } from './pages/inspector/InspectorSchedule';

// Trainer Pages
import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { AttendanceResults } from './pages/trainer/AttendanceResults';
import { TrainingSchedule } from './pages/trainer/TrainingSchedule';
import { ResultsList } from './pages/trainer/ResultsList';

// Supervisor Pages
import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
import { CreateJobOrder as SupervisorCreateJobOrder } from './pages/supervisor/CreateJobOrder';
import { ApprovalDetail } from './pages/supervisor/ApprovalDetail';
import { ApprovalsList } from './pages/supervisor/ApprovalsList';
import { TeamPerformance } from './pages/supervisor/TeamPerformance';

// Accountant Pages
import { AccountantDashboard } from './pages/accountant/AccountantDashboard';
import { PaymentVerification } from './pages/accountant/PaymentVerification';
import { PaymentsList } from './pages/accountant/PaymentsList';
import { InvoiceManagement } from './pages/accountant/InvoiceManagement';

// Manager Pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ClientManagement } from './pages/manager/ClientManagement';
import { Analytics } from './pages/manager/Analytics';
import { CertificateManagement } from './pages/manager/CertificateManagement';
import { UserManagement } from './pages/manager/UserManagement';
import { RoleManagement } from './pages/manager/RoleManagement';
import { DelegationManagement } from './pages/manager/DelegationManagement';
import { TagManagement } from './pages/manager/TagManagement';
import { ActivityLogs } from './pages/admin/ActivityLogs';
import { StickerManager } from './pages/admin/StickerManager';
import { RegionManagement } from './pages/admin/RegionManagement';

import { UserRole } from './types';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

const AppContent = () => {
  // Get current user from context
  const { currentUser } = useAppContext();
  
  console.log(' AppContent: currentUser from context:', currentUser?.name, currentUser?.id, currentUser?.currentRole);
  
  // Mock authentication state - sync with currentUser
  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser?.currentRole || 'client');
  const [userRoles, setUserRoles] = useState<UserRole[]>(currentUser?.roles || ['client']);
  
  // Update role and roles when currentUser changes
  useEffect(() => {
    console.log('📊 AppContent: currentUser changed:', currentUser?.name, currentUser?.id, currentUser?.currentRole);
    if (currentUser) {
      const newRole = currentUser.currentRole || 'client';
      const newRoles = currentUser.roles || ['client'];
      console.log('🔄 AppContent: Setting role to:', newRole, 'for user:', currentUser.name, 'ID:', currentUser.id);
      setCurrentRole(newRole);
      setUserRoles(newRoles);
      console.log('✅ AppContent: Updated role to:', newRole, 'User:', currentUser.name);
    } else {
      console.warn('⚠️ AppContent: currentUser is null');
      setCurrentRole('client');
      setUserRoles(['client']);
    }
  }, [currentUser?.id, currentUser?.currentRole, currentUser?.name]); // Depend on id, role, and name
  
  // Listen for currentUserUpdated event to force immediate update
  useEffect(() => {
    const handleCurrentUserUpdate = (event: any) => {
      const updatedUser = event.detail;
      console.log('🔔 AppContent: Received currentUserUpdated event:', updatedUser?.name, updatedUser?.id, updatedUser?.currentRole);
      // Force re-read from context by triggering state update
      if (updatedUser) {
        setCurrentRole(updatedUser.currentRole || 'client');
        setUserRoles(updatedUser.roles || ['client']);
      }
    };
    
    window.addEventListener('currentUserUpdated', handleCurrentUserUpdate as EventListener);
    return () => {
      window.removeEventListener('currentUserUpdated', handleCurrentUserUpdate as EventListener);
    };
  }, []);

  return (
    <Router>
      <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - require authentication */}

          {/* Client Routes */}
          <Route
            path="/client"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <ClientDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/client/verify"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <CertificateVerification />
              </MainLayout>
            }
          />
          <Route
            path="/client/verify/history"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <VerificationHistory />
              </MainLayout>
            }
          />
          <Route
            path="/client/verify/bulk"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <BulkVerification />
              </MainLayout>
            }
          />
          <Route
            path="/client/renewal"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <CertificateRenewal />
              </MainLayout>
            }
          />
          <Route
            path="/client/history"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <ServiceHistory />
              </MainLayout>
            }
          />
          <Route
            path="/client/profile"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <ProfileManagement />
              </MainLayout>
            }
          />
          <Route
            path="/client/payment/methods"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <PaymentMethods />
              </MainLayout>
            }
          />
          <Route
            path="/client/payment/process"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <PaymentProcessing />
              </MainLayout>
            }
          />
          <Route
            path="/client/payment/history"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <PaymentHistory />
              </MainLayout>
            }
          />
          <Route
            path="/client/payment/receipt/:receiptId"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <ReceiptDetail />
              </MainLayout>
            }
          />
          <Route
            path="/client/certificates"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <MyCertificates />
              </MainLayout>
            }
          />
          <Route
            path="/client/documents"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <DocumentManagement />
              </MainLayout>
            }
          />
          <Route
            path="/client/settings"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <Settings />
              </MainLayout>
            }
          />
          <Route
            path="/client/communication-preferences"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <CommunicationPreferences />
              </MainLayout>
            }
          />
          <Route
            path="/client/support"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <ContactSupport />
              </MainLayout>
            }
          />
          <Route
            path="/client/support/tickets"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <SupportTickets />
              </MainLayout>
            }
          />
          <Route
            path="/client/legal"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <LegalInformation />
              </MainLayout>
            }
          />
          <Route
            path="/client/privacy"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <PrivacyPolicy />
              </MainLayout>
            }
          />
          <Route
            path="/client/new-service"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <NewServiceRequest />
              </MainLayout>
            }
          />
          <Route
            path="/client/cpd"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <CPDLibrary />
              </MainLayout>
            }
          />
          <Route
            path="/client/cpd/:categoryId"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <CPDCategoryDetail />
              </MainLayout>
            }
          />
          <Route
            path="/client/cpd/:categoryId/video/:videoId"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <CPDVideoPlayer />
              </MainLayout>
            }
          />
          <Route
            path="/client/cpd/:categoryId/quiz/:quizId"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <CPDQuiz />
              </MainLayout>
            }
          />
          <Route
            path="/client/cpd/:categoryId/exercise/:exerciseId"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <CPDExercise />
              </MainLayout>
            }
          />

          {/* Inspector Routes */}
          <Route
            path="/inspector"
            element={
              <MainLayout
                userRole="inspector"
                userRoles={['inspector']}
                onRoleChange={setCurrentRole}
              >
                <InspectorDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/inspector/jobs/:jobId"
            element={
              <MainLayout
                userRole="inspector"
                userRoles={['inspector']}
                onRoleChange={setCurrentRole}
              >
                <JobOrderDetail />
              </MainLayout>
            }
          />
          <Route
            path="/inspector/jobs"
            element={
              <MainLayout
                userRole="inspector"
                userRoles={['inspector']}
                onRoleChange={setCurrentRole}
              >
                <JobOrdersList />
              </MainLayout>
            }
          />
          <Route
            path="/inspector/jobs/new"
            element={
              <MainLayout
                userRole="inspector"
                userRoles={['inspector']}
                onRoleChange={setCurrentRole}
              >
                <NewJobOrder />
              </MainLayout>
            }
          />
          <Route
            path="/inspector/stickers"
            element={
              <MainLayout
                userRole="inspector"
                userRoles={['inspector']}
                onRoleChange={setCurrentRole}
              >
                <StickerStock />
              </MainLayout>
            }
          />
          <Route
            path="/inspector/schedule"
            element={
              <MainLayout
                userRole="inspector"
                userRoles={['inspector']}
                onRoleChange={setCurrentRole}
              >
                <InspectorSchedule />
              </MainLayout>
            }
          />

          {/* Trainer Routes */}
          <Route
            path="/trainer"
            element={
              <MainLayout
                userRole="trainer"
                userRoles={['trainer']}
                onRoleChange={setCurrentRole}
              >
                <TrainerDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/trainer/results/:sessionId"
            element={
              <MainLayout
                userRole="trainer"
                userRoles={['trainer']}
                onRoleChange={setCurrentRole}
              >
                <AttendanceResults />
              </MainLayout>
            }
          />
          <Route
            path="/trainer/schedule"
            element={
              <MainLayout
                userRole="trainer"
                userRoles={['trainer']}
                onRoleChange={setCurrentRole}
              >
                <TrainingSchedule />
              </MainLayout>
            }
          />
          <Route
            path="/trainer/results"
            element={
              <MainLayout
                userRole="trainer"
                userRoles={['trainer']}
                onRoleChange={setCurrentRole}
              >
                <ResultsList />
              </MainLayout>
            }
          />

          {/* Supervisor Routes */}
          <Route
            path="/supervisor"
            element={
              <MainLayout
                userRole="supervisor"
                userRoles={['supervisor']}
                onRoleChange={setCurrentRole}
              >
                <SupervisorDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/supervisor/jobs/create"
            element={
              <MainLayout
                userRole="supervisor"
                userRoles={['supervisor']}
                onRoleChange={setCurrentRole}
              >
                <SupervisorCreateJobOrder />
              </MainLayout>
            }
          />
          <Route
            path="/supervisor/approvals/:jobId"
            element={
              <MainLayout
                userRole="supervisor"
                userRoles={['supervisor']}
                onRoleChange={setCurrentRole}
              >
                <ApprovalDetail />
              </MainLayout>
            }
          />
          <Route
            path="/supervisor/approvals"
            element={
              <MainLayout
                userRole="supervisor"
                userRoles={['supervisor']}
                onRoleChange={setCurrentRole}
              >
                <ApprovalsList />
              </MainLayout>
            }
          />
          <Route
            path="/supervisor/team"
            element={
              <MainLayout
                userRole="supervisor"
                userRoles={['supervisor']}
                onRoleChange={setCurrentRole}
              >
                <TeamPerformance />
              </MainLayout>
            }
          />

          {/* Accountant Routes */}
          <Route
            path="/accountant"
            element={
              <MainLayout
                userRole="accountant"
                userRoles={['accountant']}
                onRoleChange={setCurrentRole}
              >
                <AccountantDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/accountant/payments/:paymentId"
            element={
              <MainLayout
                userRole="accountant"
                userRoles={['accountant']}
                onRoleChange={setCurrentRole}
              >
                <PaymentVerification />
              </MainLayout>
            }
          />
          <Route
            path="/accountant/payments"
            element={
              <MainLayout
                userRole="accountant"
                userRoles={['accountant']}
                onRoleChange={setCurrentRole}
              >
                <PaymentsList />
              </MainLayout>
            }
          />
          <Route
            path="/accountant/invoices"
            element={
              <MainLayout
                userRole="accountant"
                userRoles={['accountant']}
                onRoleChange={setCurrentRole}
              >
                <InvoiceManagement />
              </MainLayout>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager"
            element={
              <MainLayout
                userRole="manager"
                userRoles={['manager']}
                onRoleChange={setCurrentRole}
              >
                <ManagerDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/manager/analytics"
            element={
              <MainLayout
                userRole="manager"
                userRoles={['manager']}
                onRoleChange={setCurrentRole}
              >
                <Analytics />
              </MainLayout>
            }
          />
          <Route
            path="/manager/certificates"
            element={
              <MainLayout
                userRole="manager"
                userRoles={['manager']}
                onRoleChange={setCurrentRole}
              >
                <CertificateManagement />
              </MainLayout>
            }
          />
          <Route
            path="/manager/delegation"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <DelegationManagement />
              </MainLayout>
            }
          />
          <Route
            path="/manager/regions"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <RegionManagement />
              </MainLayout>
            }
          />
          <Route
            path="/manager/tags"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <TagManagement />
              </MainLayout>
            }
          />
          <Route
            path="/manager/users"
            element={
              <MainLayout
                userRole="manager"
                userRoles={['manager']}
                onRoleChange={setCurrentRole}
              >
                <UserManagement />
              </MainLayout>
            }
          />
          <Route
            path="/manager/roles"
            element={
              <MainLayout
                userRole="manager"
                userRoles={['manager', 'gm']}
                onRoleChange={setCurrentRole}
              >
                <RoleManagement />
              </MainLayout>
            }
          />
          <Route
            path="/manager/activity-logs"
            element={
              <MainLayout
                userRole="manager"
                userRoles={['manager', 'gm']}
                onRoleChange={setCurrentRole}
              >
                <ActivityLogs />
              </MainLayout>
            }
          />
          <Route
            path="/manager/stickers"
            element={
              <MainLayout
                userRole="manager"
                userRoles={['manager', 'gm']}
                onRoleChange={setCurrentRole}
              >
                <StickerManager />
              </MainLayout>
            }
          />
          <Route
            path="/manager/clients"
            element={
              <MainLayout
                userRole="manager"
                userRoles={['manager', 'gm']}
                onRoleChange={setCurrentRole}
              >
                <ClientManagement />
              </MainLayout>
            }
          />

          {/* Notifications - Common route for all roles */}
          <Route
            path="/notifications"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
              >
                <Notifications />
              </MainLayout>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

