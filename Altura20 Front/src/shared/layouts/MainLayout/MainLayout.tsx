import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleNavClick() {
    // On mobile, close sidebar after navigating; on desktop, leave it open
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="h-full bg-gray-50">
      <TopBar onToggleSidebar={() => setSidebarOpen((o) => !o)} />

      {/* Mobile backdrop — sits between topbar and sidebar, desktop never shows */}
      {sidebarOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 top-14 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onNavClick={handleNavClick} />

      <main
        className={`animate-page-in flex flex-col
          min-h-[calc(100vh-3.5rem)] pt-14
          md:min-h-[calc(100vh-3.5rem-2.5rem)] md:pb-10
          transition-[margin] duration-300
          ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}
      >
        <div className="flex-1 p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}
