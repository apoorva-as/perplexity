import { RouterProvider } from "react-router"
import { router } from "./app.routes"
import { useAuth } from "../features/auth/hook/useAuth"
import { useEffect } from "react"


function App() {

  const auth = useAuth()

  useEffect(() => {
    auth.handleGetMe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

  return (
    <RouterProvider router={router} />
  )
}

export default App