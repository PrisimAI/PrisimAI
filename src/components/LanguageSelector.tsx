import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { languages, type Language } from '@/i18n'

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const handleLanguageChange = (value: Language) => {
    i18n.changeLanguage(value)
  }

  return (
    <Select value={i18n.language as Language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(languages).map(([code, { nativeName }]) => (
          <SelectItem key={code} value={code}>
            {nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
