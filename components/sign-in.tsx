import { signIn } from "@/auth"
import { Button } from "./ui/button"
import { login } from "@/lib/actions"

export default function SignIn() {
  return (
    <form
      action={login}
    >
      <Button type="submit">Signin with Google</Button>
    </form>
  )
} 