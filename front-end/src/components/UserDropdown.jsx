import Image from 'next/image'
import { useRouter } from 'next/router'
import { CaretDown, UserGear, SignOut } from 'phosphor-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import ThemeToggleDropdown from './ThemeToggleDropdown'
import useAuth from '../hooks/useAuth'

export default function UserDropdown() {
  const router = useRouter()
  const user = useAuth()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer flex flex-col items-center">
          <div className="mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={user?.image || '/placeholder.png'}
                alt={user?.name || 'Usuário'}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          {user && (
            <div className="flex gap-2">
              <p className="text-center">{user.name || 'Usuário'}</p>
              <CaretDown size={16} className="mt-1" />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push('/minha-conta')}>
          <UserGear className="mr-2 h-4 w-4" /> Conta
        </DropdownMenuItem>
        <ThemeToggleDropdown />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <SignOut className="mr-2 h-4 w-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

UserDropdown.propTypes = {}