import { signIn } from "@/auth"
import { Button } from "@/shared/components/ui/button"
import { login } from "@/shared/lib/actions"

export default function SignIn() {
  return (
    <form
      action={login}
    >
      <Button type="submit">Signin with Google</Button>
    </form>
  )
} 