// src/App.jsx
import { useState } from "react"
import { ThemeProvider } from "./theme"
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	Outlet,
} from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { AppProvider } from "./context/AppContext"
import { ExamProvider } from "./context/ExamContext"
import { ToastProvider } from "./components/common/Toast"
import Topbar from "./components/layout/Topbar"
import Sidebar from "./components/layout/Sidebar"
import ChatBot from "./components/rag/ChatBot"
import ForcePasswordChange from "./components/auth/ForcePasswordChange"
import Login from "./pages/Login"
import Dashboard from "./components/dashboard/Dashboard"
import Faculty from "./components/faculty/Faculty"
import RoomConfig from "./components/rooms/RoomConfig"
import Schedule from "./components/schedule/Schedule"
import Leaves from "./components/leaves/Leaves"
import Allocate from "./components/allocate/Allocate"
import Seating from "./components/seating/Seating"
import ExamEvents from "./components/exam/ExamEvents"
import RetrieveInfo from "./components/rag/RagPipeline"
import StudentDashboard from "./pages/StudentDashboard"
import MySeat from "./pages/MySeat"
import Profile from "./pages/Profile"
import FacultyProfile from "./pages/FacultyProfile"
import FacultyPortal from "./pages/FacultyPortal"
import StudentsList from "./pages/StudentsList"
import AccessRequests from "./components/auth/AccessRequests"

// ── Route guard ───────────────────────────────────────────────────
function RequireAuth({ allowedRoles }) {
	const { user, loading } = useAuth()
	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center font-mono text-[var(--ui-muted)] bg-[var(--ui-bg)]">
				Loading...
			</div>
		)
	if (!user) return <Navigate to="/login" replace />
	if (user.mustChangePassword) return <ForcePasswordChange />
	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return (
			<Navigate
				to={
					user.role === "student"
						? "/student"
						: user.role === "faculty"
							? "/faculty-portal"
							: "/"
				}
				replace
			/>
		)
	}
	return <Outlet />
}

// ── App layout with chatbot ───────────────────────────────────────
function AppLayout() {
	const { isAdmin } = useAuth()
	const [chatOpen, setChatOpen] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)

	return (
		<div className="invigra-shell min-h-screen">
			<Topbar onMenu={() => setMenuOpen(o => !o)}
				onToggleChat={
					isAdmin ? () => setChatOpen((o) => !o) : undefined
				}
			/>
			<div className="flex" style={{ minHeight: "calc(100vh - 56px)" }}>
				<Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
				<main className="invigra-main flex-1 p-5 md:p-8 overflow-y-auto min-h-0">
					<Outlet />
				</main>
			</div>
			{isAdmin && (
				<ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
			)}
		</div>
	)
}

// ── Routes ─────────────────────────────────────────────────────────
function AppRoutes() {
	const { user } = useAuth()
	const defaultRedirect =
		user?.role === "student"
			? "/student"
			: user?.role === "faculty"
				? "/faculty-portal"
				: "/"

	return (
		<Routes>
			<Route
				path="/login"
				element={
					user ? <Navigate to={defaultRedirect} replace /> : <Login />
				}
			/>

			{/* Admin routes */}
			<Route element={<RequireAuth allowedRoles={["admin"]} />}>
				<Route element={<AppLayout />}>
					<Route path="/" element={<Dashboard />} />
					<Route path="/events" element={<ExamEvents />} />
					<Route path="/faculty" element={<Faculty />} />
					<Route path="/rooms" element={<RoomConfig />} />
					<Route path="/schedule" element={<Schedule />} />
					<Route path="/leaves" element={<Leaves />} />
					<Route path="/allocate" element={<Allocate />} />
					<Route path="/seating" element={<Seating />} />
					<Route path="/retrieve" element={<RetrieveInfo />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/students" element={<StudentsList />} />
					<Route path="/access" element={<AccessRequests />} />
				</Route>
			</Route>

			{/* Faculty routes - same as admin but with read-only controls */}
			<Route element={<RequireAuth allowedRoles={["faculty"]} />}>
				<Route element={<AppLayout />}>
					<Route
						path="/"
						element={<Navigate to="/faculty-portal" replace />}
					/>
					<Route path="/faculty-portal" element={<FacultyPortal />} />
					<Route path="/events" element={<ExamEvents />} />
					<Route path="/faculty" element={<Faculty />} />
					<Route path="/rooms" element={<RoomConfig />} />
					<Route path="/schedule" element={<Schedule />} />
					<Route path="/leaves" element={<Leaves />} />
					<Route path="/allocate" element={<Allocate />} />
					<Route path="/seating" element={<Seating />} />
					<Route path="/profile" element={<FacultyProfile />} />
				</Route>
			</Route>

			{/* Student */}
			<Route element={<RequireAuth allowedRoles={["student"]} />}>
				<Route element={<AppLayout />}>
					<Route path="/student" element={<StudentDashboard />} />
					<Route path="/student/seat" element={<MySeat />} />
					<Route
						path="/student/schedule"
						element={<StudentDashboard />}
					/>
				</Route>
			</Route>

			<Route
				path="*"
				element={
					<Navigate to={user ? defaultRedirect : "/login"} replace />
				}
			/>
		</Routes>
	)
}

export default function App() {
	return (
		<BrowserRouter>
			<ThemeProvider>
			<AuthProvider>
				<AppProvider>
					<ExamProvider>
						<ToastProvider>
							<AppRoutesWrapper />
						</ToastProvider>
					</ExamProvider>
				</AppProvider>
			</AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	)
}

function AppRoutesWrapper() {
	return <AppRoutes />
}
