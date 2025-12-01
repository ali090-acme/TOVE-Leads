import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/auth/Login';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { CertificateVerification } from './pages/client/CertificateVerification';
import { CertificateRenewal } from './pages/client/CertificateRenewal';
import { ServiceHistory } from './pages/client/ServiceHistory';
import { NewServiceRequest } from './pages/client/NewServiceRequest';

// Inspector Pages
import { InspectorDashboard } from './pages/inspector/InspectorDashboard';
import { JobOrderDetail } from './pages/inspector/JobOrderDetail';
import { JobOrdersList } from './pages/inspector/JobOrdersList';

// Trainer Pages
import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { AttendanceResults } from './pages/trainer/AttendanceResults';
import { TrainingSchedule } from './pages/trainer/TrainingSchedule';
import { ResultsList } from './pages/trainer/ResultsList';

// Supervisor Pages
import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
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
import { Analytics } from './pages/manager/Analytics';
import { CertificateManagement } from './pages/manager/CertificateManagement';
import { UserManagement } from './pages/manager/UserManagement';

import { UserRole } from './types';

function App() {
  // Mock authentication state - in real app, this would come from auth context
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [userRoles] = useState<UserRole[]>(['client', 'inspector']); // Multi-role user example
  const [userName] = useState('John Doe');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Client Routes */}
          <Route
            path="/client"
            element={
              <MainLayout
                userRole={currentRole}
                userRoles={userRoles}
                onRoleChange={setCurrentRole}
                userName={userName}
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
                userName={userName}
              >
                <CertificateVerification />
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
                userName={userName}
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
                userName={userName}
              >
                <ServiceHistory />
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
                userName={userName}
              >
                <NewServiceRequest />
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
              >
                <JobOrdersList />
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
              >
                <SupervisorDashboard />
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
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
                userName={userName}
              >
                <CertificateManagement />
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
                userName={userName}
              >
                <UserManagement />
              </MainLayout>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;

