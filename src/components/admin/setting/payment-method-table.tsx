import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { PaymentMethod } from '@/services/admin/payment-method.service'
import { Image } from 'lucide-react'

interface PaymentMethodTableProps {
  methods: PaymentMethod[]
  isLoading: boolean
  onUpdate: (
    id: number,
    data: { is_active?: boolean; priority?: number },
  ) => void
}

export function PaymentMethodTable({
  methods,
  isLoading,
  onUpdate,
}: PaymentMethodTableProps) {
  return (
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-700">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[80px]">Logo</TableHead>
            <TableHead>Method Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead className="w-[100px]">Priority</TableHead>
            <TableHead className="text-center w-[120px]">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-5 w-full bg-muted/50 animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : methods.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-20 text-muted-foreground italic"
              >
                No payment methods found.
              </TableCell>
            </TableRow>
          ) : (
            methods
              .sort((a, b) => a.priority - b.priority)
              .map((method) => (
                <TableRow
                  key={method.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="w-10 h-10 rounded border bg-white flex items-center justify-center overflow-hidden p-1 shadow-sm">
                      {method.image_url ? (
                        <img
                          src={method.image_url}
                          alt={method.name}
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <Image className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground">
                        {method.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-tighter font-medium">
                        {method.description || 'Global Payment Gateway'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-widest">
                    {method.code}
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded border border-border uppercase tracking-wide">
                      {method.driver}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={method.priority}
                      className="h-8 w-16 text-xs text-center font-bold"
                      onBlur={(e) => {
                        const val = parseInt(e.target.value)
                        if (val !== method.priority) {
                          onUpdate(method.id, { priority: val })
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Switch
                        checked={method.is_active}
                        onCheckedChange={(checked) =>
                          onUpdate(method.id, { is_active: checked })
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
