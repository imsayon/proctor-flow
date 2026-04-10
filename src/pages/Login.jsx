// src/pages/Login.jsx
// DUMMY AUTH PAGE - Simple role selection
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Shield, Users, BookOpen, User, Zap } from "lucide-react"

const ROLES = [
	{
		value: "admin",
		label: "Admin",
		description: "Manage system, faculty, events & seating",
		icon: Shield,
		color: "#f0a500",
	},
	{
		value: "faculty",
		label: "Faculty",
		description: "View assignments & student schedules",
		icon: BookOpen,
		color: "#58a6ff",
	},
	{
		value: "student",
		label: "Student",
		description: "Check seating & exam schedule",
		icon: Users,
		color: "#3fb950",
	},
	{
		value: "other",
		label: "Other",
		description: "Limited access user",
		icon: User,
		color: "#d29922",
	},
]

export default function Login() {
	const { login } = useAuth()
	const navigate = useNavigate()
	const [selectedRole, setSelectedRole] = useState(null)
	const [loading, setLoading] = useState(false)

	const handleLogin = async (role) => {
		setLoading(true)
		try {
			await login(role)
			navigate("/")
		} catch (err) {
			console.error("Login failed:", err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
			<div className="w-full max-w-2xl">
				{/* Logo */}
				<div className="text-center mb-12">
					<div className="text-4xl font-bold tracking-tight mb-2">
						<span className="text-[#f0a500]">Proctor</span>Flow
					</div>
					<div className="font-mono text-sm text-[#7d8590] mb-2">
						Exam Duty & Seating Allocation System
					</div>
					<div className="font-mono text-xs text-[#484f58] flex items-center justify-center gap-2">
						<Zap size={14} /> Production Deployment
					</div>
				</div>

				{/* Role Selection */}
				<div className="bg-[#161b22] border border-[#30363d] p-8 rounded-lg">
					<div className="mb-8">
						<h2 className="text-xl font-semibold text-[#e6edf3] mb-2">
							Select Your Role
						</h2>
						<p className="text-sm text-[#7d8590]">
							Choose the role to access the system as:
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
						{ROLES.map((role) => {
							const Icon = role.icon
							return (
								<button
									key={role.value}
									onClick={() => setSelectedRole(role.value)}
									className={`relative p-4 rounded-lg border-2 transition-all text-left group`}
									style={{
										borderColor:
											selectedRole === role.value
												? role.color
												: "#30363d",
										backgroundColor:
											selectedRole === role.value
												? `${role.color}15`
												: "#0d1117",
									}}
									onMouseEnter={(e) => {
										if (selectedRole !== role.value) {
											e.currentTarget.style.borderColor =
												"#484f58"
										}
									}}
									onMouseLeave={(e) => {
										if (selectedRole !== role.value) {
											e.currentTarget.style.borderColor =
												"#30363d"
										}
									}}
								>
									<div className="flex items-start gap-3">
										<Icon
											size={20}
											style={{ color: role.color }}
											className="mt-1 flex-shrink-0"
										/>
										<div className="flex-1">
											<div className="font-semibold text-[#e6edf3] flex items-center gap-2">
												{role.label}
												{selectedRole ===
													role.value && (
													<div
														className="w-2 h-2 rounded-full"
														style={{
															backgroundColor:
																role.color,
														}}
													></div>
												)}
											</div>
											<p className="text-xs text-[#7d8590] mt-1">
												{role.description}
											</p>
										</div>
									</div>
								</button>
							)
						})}
					</div>

					{selectedRole && (
						<div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 mb-6">
							<p className="text-xs text-[#7d8590] mb-3">
								<span className="font-semibold text-[#e6edf3]">
									Role:
								</span>{" "}
								<span className="capitalize font-mono">
									{selectedRole}
								</span>
							</p>
							<p className="text-xs text-[#7d8590] font-mono">
								<span className="text-[#3fb950]">✓</span> Ready
								to access the system
							</p>
						</div>
					)}

					<button
						onClick={() =>
							selectedRole && handleLogin(selectedRole)
						}
						disabled={!selectedRole || loading}
						className="w-full py-3 px-4 rounded-lg border-2 font-semibold transition-all text-[#f0a500] border-[#f0a500]"
						style={{
							backgroundColor:
								selectedRole && !loading
									? "#f0a50015"
									: "#1c2128",
							cursor:
								selectedRole && !loading
									? "pointer"
									: "not-allowed",
							opacity: selectedRole && !loading ? 1 : 0.5,
						}}
					>
						{loading ? (
							<span className="flex items-center justify-center gap-2">
								<div className="animate-spin text-lg">⚙️</div>
								Logging in...
							</span>
						) : (
							<span className="flex items-center justify-center gap-2">
								Continue as{" "}
								{selectedRole &&
									selectedRole.charAt(0).toUpperCase() +
										selectedRole.slice(1)}
								<ArrowRight size={16} />
							</span>
						)}
					</button>

					<div className="mt-6 pt-6 border-t border-[#30363d]">
						<p className="text-[10px] text-[#7d8590] font-mono uppercase tracking-widest mb-2">
							Application Info
						</p>
						<p className="text-xs text-[#7d8590]">
							PrctorFlow v1.0.0 • Production Deployment
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
