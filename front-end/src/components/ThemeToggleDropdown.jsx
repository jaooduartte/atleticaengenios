
import { Moon, Sun, Laptop2, ChevronLeft } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
export default function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenuSub>

      <DropdownMenuSubTrigger leftIcon={<ChevronLeft className="h-4 w-4" />} rightIcon={null}>

        Tema
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-56">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun className="mr-2 h-4 w-4" />
            Tema claro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="mr-2 h-4 w-4" />
            Tema escuro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Laptop2 className="mr-2 h-4 w-4" />
            Corresponder ao sistema
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

ThemeToggleDropdown.propTypes = {}

