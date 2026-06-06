import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

const COUNTRY_CODES = [
  { value: '+62', label: 'ID (+62)' },
  { value: '+1', label: 'US/CA (+1)' },
  { value: '+44', label: 'UK (+44)' },
  { value: '+61', label: 'AU (+61)' },
  { value: '+65', label: 'SG (+65)' },
  { value: '+60', label: 'MY (+60)' },
  { value: '+63', label: 'PH (+63)' },
  { value: '+81', label: 'JP (+81)' },
  { value: '+82', label: 'KR (+82)' },
  { value: '+84', label: 'VN (+84)' },
  { value: '+66', label: 'TH (+66)' },
  { value: '+91', label: 'IN (+91)' },
  { value: '+86', label: 'CN (+86)' },
  { value: '+971', label: 'AE (+971)' },
  { value: '+966', label: 'SA (+966)' },
  { value: '+27', label: 'ZA (+27)' },
  { value: '+49', label: 'DE (+49)' },
  { value: '+33', label: 'FR (+33)' },
  { value: '+39', label: 'IT (+39)' },
  { value: '+34', label: 'ES (+34)' },
  { value: '+55', label: 'BR (+55)' },
  { value: '+52', label: 'MX (+52)' },
]

export function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  const [countryCode, setCountryCode] = React.useState('+62')
  const [phoneNumber, setPhoneNumber] = React.useState('')

  React.useEffect(() => {
    if (value) {
      // Find matching country code from our list that starts the value
      const matchedCode = COUNTRY_CODES.find(c => value.startsWith(c.value))
      if (matchedCode) {
        setCountryCode(matchedCode.value)
        setPhoneNumber(value.slice(matchedCode.value.length))
      } else {
        // Fallback if country code is not in list but starts with +
        if (value.startsWith('+')) {
          const match = value.match(/^(\+\d{1,3})(.*)$/)
          if (match) {
            setCountryCode(match[1])
            setPhoneNumber(match[2])
          }
        } else {
          setPhoneNumber(value)
        }
      }
    } else {
      setPhoneNumber('')
    }
  }, [value])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const newNumber = e.target.value.replace(/\D/g, '')
    setPhoneNumber(newNumber)
    
    if (newNumber) {
      onChange(`${countryCode}${newNumber}`)
    } else {
      onChange('')
    }
  }

  const handleCountryChange = (code: string) => {
    setCountryCode(code)
    if (phoneNumber) {
      onChange(`${code}${phoneNumber}`)
    }
  }

  return (
    <div className="flex gap-2">
      <Select 
        value={countryCode} 
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[120px] rounded-xl !h-11 bg-white">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {COUNTRY_CODES.map((country) => (
            <SelectItem key={country.value} value={country.value}>
              {country.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        disabled={disabled}
        placeholder="812-3456-7890"
        className="flex-1 rounded-xl !h-11"
      />
    </div>
  )
}
