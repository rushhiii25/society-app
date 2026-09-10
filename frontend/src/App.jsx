import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import LogComplaintForm from './components/LogComplaintForm';
import AiIntakeAssistant from './components/AiIntakeAssistant';
import AiCopilotTabs from './components/AiCopilotTabs';
import ComplaintTable from './components/ComplaintTable';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const activeTab = useSelector((state) => state.complaint.activeTab);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="app-container">
      <Navbar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="main-container">
        {activeTab === 'form' && (
          <>
            <div className="grid-layout">
              <LogComplaintForm />
              <AiIntakeAssistant />
            </div>
            <AiCopilotTabs />
          </>
        )}

        {activeTab === 'registry' && <ComplaintTable />}
      </main>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
