// src/context/AuthContext.jsx
// DUMMY AUTH - All auth mechanisms bypassed
import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react"

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		try {
			return JSON.parse(sessionStorage.getItem("pf_user"))
		} catch {
			return null
		}
	})
	const [loading, setLoading] = useState(false)
	const [authError, setAuthError] = useState(null)

	const login = useCallback(async (role) => {
		setAuthError(null)
		const dummyUser = {
			uid: `dummy_${role}_${Date.now()}`,
			email: `${role}@example.com`,
			name: role.charAt(0).toUpperCase() + role.slice(1),
			role: role,
			institutionId: "demo-institution",
			employeeId: `EMP_${role.toUpperCase()}`,
			usn: `USN_${role.toUpperCase()}`,
			rollNo: `ROLL_${role.toUpperCase()}`,
			branch: "Computer Science",
			mustChangePassword: false,
		}
		setUser(dummyUser)
		sessionStorage.setItem("pf_user", JSON.stringify(dummyUser))
		return dummyUser
	}, [])

	const signUp = useCallback(
		async (role) => {
			return login(role)
		},
		[login],
	)

	const requestAccess = useCallback(async () => {
		// Dummy implementation - no-op
		return
	}, [])

	const bootstrapAdmin = useCallback(async () => {
		// Dummy implementation - no-op
		return
	}, [])

	const logout = useCallback(async () => {
		setUser(null)
		sessionStorage.removeItem("pf_user")
	}, [])

	const changePassword = useCallback(
		async (newPassword) => {
			// Dummy implementation - no-op
			if (user) {
				setUser((prev) => ({ ...prev, mustChangePassword: false }))
			}
		},
		[user],
	)

	const value = {
		user,
		loading,
		authError,
		login,
		signUp,
		requestAccess,
		bootstrapAdmin,
		logout,
		changePassword,
		isAdmin: user?.role === "admin",
		isStudent: user?.role === "student",
		isFaculty: user?.role === "faculty",
		institutionId: user?.institutionId || "demo-institution",
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
