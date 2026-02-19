'use client';

import { useState, useCallback } from "react";
import { useSupabaseData } from "@/lib/hooks/useSupabaseData";
import { Icons } from "@/components/ui/Icons";
import FloralCorner from "@/components/ui/FloralCorner";
import OnboardingScreen from "@/components/screens/OnboardingScreen";
import RekodHome from "@/components/screens/RekodHome";
import CreateSession from "@/components/screens/CreateSession";
import KeyInScreen from "@/components/screens/KeyInScreen";
import ReviewScreen from "@/components/screens/ReviewScreen";
import AnalisisScreen from "@/components/screens/AnalisisScreen";
import LaporanScreen from "@/components/screens/LaporanScreen";
import TetapanScreen from "@/components/screens/TetapanScreen";

export default function PbdApp() {
  const {
    loading: dataLoading,
    classes,
    students,
    curriculumSets,
    curriculum,
    sessions,
    hasData,
    createClass,
    renameClass,
    deleteClass,
    importStudents,
    addStudent,
    deleteStudent,
    deleteStudents,
    importCurriculum,
    updateCurriculumSet,
    deleteCurriculumSet,
    createSession,
    updateResult,
    fetchAll,
    deleteAllClasses,
    completeOnboarding,
  } = useSupabaseData();

  const [activeTab, setActiveTab] = useState("rekod");
  const [view, setView] = useState("home"); // home | create | keyin | review
  const [activeSession, setActiveSession] = useState(null);

  const openSession = (session) => {
    setActiveSession(session);
    setView("keyin");
  };

  const newSession = () => setView("create");

  const saveNewSession = async (form) => {
    try {
      const newSess = await createSession(form);
      setActiveSession(newSess);
      setView("keyin");
    } catch (err) {
      console.error('Error creating session:', err);
      alert('Ralat mencipta sesi: ' + err.message);
    }
  };

  const handleUpdateResult = useCallback((studentId, tp) => {
    if (!activeSession) return;
    updateResult(activeSession.id, studentId, tp);
  }, [activeSession, updateResult]);

  const navItems = [
    { key: "rekod", label: "Rekod", Icon: Icons.rekod },
    { key: "analisis", label: "Analisis", Icon: Icons.analisis },
    { key: "laporan", label: "Laporan", Icon: Icons.laporan },
    { key: "tetapan", label: "Tetapan", Icon: Icons.tetapan },
  ];

  // Show loading while data is being fetched
  if (dataLoading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Memuatkan data...</p>
    </div>
  );

  // Show onboarding if no data yet
  if (!hasData) return (
    <div className="app-wrapper">
      <svg className="floral-corner floral-tl" viewBox="0 0 160 160"><FloralCorner/></svg>
      <svg className="floral-corner floral-br" viewBox="0 0 160 160"><FloralCorner/></svg>
      <OnboardingScreen onComplete={async (importedStudents, importedCurriculum) => {
        // Data is now saved to Supabase via the onboarding screen
        // Mark user as onboarded
        await completeOnboarding();
        // Refresh all data
        await fetchAll();
      }} createClass={createClass} importStudents={importStudents} importCurriculum={importCurriculum}/>
    </div>
  );

  // Full screen views (no nav)
  if (view === "create") return (
    <div className="app-wrapper">
      <CreateSession curriculum={curriculum} students={students} onSave={saveNewSession} onBack={() => setView("home")}/>
    </div>
  );

  if (view === "keyin" && activeSession) {
    const currentSession = sessions.find(s => s.id === activeSession.id) || activeSession;
    return (
      <div className="app-wrapper">
        <KeyInScreen session={currentSession} students={students} onUpdateResult={handleUpdateResult}
          onFinish={() => setView("review")} onBack={() => setView("home")}/>
      </div>
    );
  }

  if (view === "review" && activeSession) {
    const currentSession = sessions.find(s => s.id === activeSession.id) || activeSession;
    return (
      <div className="app-wrapper">
        <ReviewScreen session={currentSession} students={students}
          onBack={() => { setView("home"); setActiveSession(null); }}
          onEdit={() => setView("keyin")}/>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <svg className="floral-corner floral-tl" viewBox="0 0 160 160" style={{ opacity: 0.12 }}><FloralCorner/></svg>
      <svg className="floral-corner floral-br" viewBox="0 0 160 160" style={{ opacity: 0.12 }}><FloralCorner/></svg>

      {activeTab === "rekod" && (
        <RekodHome sessions={sessions} students={students} onOpenSession={openSession} onNewSession={newSession}/>
      )}
      {activeTab === "analisis" && (
        <AnalisisScreen sessions={sessions} students={students}/>
      )}
      {activeTab === "laporan" && (
        <LaporanScreen sessions={sessions} students={students} curriculum={curriculum} classes={classes}/>
      )}
      {activeTab === "tetapan" && (
        <TetapanScreen
          students={students} curriculum={curriculum} curriculumSets={curriculumSets} classes={classes}
          createClass={createClass} renameClass={renameClass} deleteClass={deleteClass} deleteAllClasses={deleteAllClasses}
          addStudent={addStudent} deleteStudent={deleteStudent} deleteStudents={deleteStudents}
          importStudents={importStudents}
          importCurriculum={importCurriculum} updateCurriculumSet={updateCurriculumSet}
          deleteCurriculumSet={deleteCurriculumSet}
        />
      )}

      <nav className="bottom-nav">
        {navItems.map(({ key, label, Icon }) => (
          <button key={key} className={`nav-item ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
            <Icon/>
            {label}
            <div className="nav-dot"/>
          </button>
        ))}
      </nav>
    </div>
  );
}
