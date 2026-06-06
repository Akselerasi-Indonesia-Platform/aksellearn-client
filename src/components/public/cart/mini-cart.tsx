import * as React from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import {
  ShoppingBag,
  X,
  Loader2,
  BookOpen,
  Plus,
  Minus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/use-cart'
import { useUIStore } from '@/hooks/use-ui-store'
import { formatCurrency } from '@/lib/utils'

export function MiniCart() {
  const navigate = useNavigate()
  const { isMiniCartOpen, closeMiniCart } = useUIStore()
  const { cart, removeFromCart, isRemoving, updateQuantity, isUpdating } = useCart()

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id)
    } else {
      updateQuantity({ id, quantity: newQuantity })
    }
  }

  const handleCheckout = () => {
    closeMiniCart()
    navigate({ to: '/cart' })
  }

  return (
    <Sheet
      open={isMiniCartOpen}
      onOpenChange={(open) => !open && closeMiniCart()}
    >
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-none shadow-2xl">
        <SheetHeader className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-xl font-bold text-slate-900">
                Cart
              </SheetTitle>
              {cart?.total_items && cart.total_items > 0 ? (
                <Badge className="bg-primary/10 text-primary border-none rounded-full px-2 text-[10px] font-bold">
                  {cart.total_items} {cart.total_items === 1 ? 'Item' : 'Items'}
                </Badge>
              ) : null}
            </div>
            <SheetClose className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
              <X className="size-4" />
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          {!cart || cart.items?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <ShoppingBag className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900">
                  Your cart is empty
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Keep shopping to find a course!
                </p>
              </div>
              <Button
                onClick={() => {
                  closeMiniCart()
                  navigate({ to: '/search' })
                }}
                className="rounded-lg h-10 px-6 font-bold text-sm"
              >
                Browse Courses
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {cart.items?.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group"
                      >
                        <div className="flex gap-4">
                          <div className="size-16 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                            {(item.image_url || item.thumbnail) ? (
                              <img
                                src={item.image_url || item.thumbnail}
                                className="w-full h-full object-cover"
                                alt={item.name}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <BookOpen className="size-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-primary transition-colors">
                                <Link to="/course/$courseSlug" params={{ courseSlug: (item as any).slug || item.uuid }} onClick={closeMiniCart}>
                                    {item.name}
                                </Link>
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.uuid)}
                                disabled={isRemoving}
                                className="text-slate-300 hover:text-rose-500 transition-colors shrink-0 p-1"
                              >
                                {isRemoving ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <X className="size-3" />
                                )}
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900">
                                    {formatCurrency(item.final_price)}
                                  </span>
                                  {item.base_price > item.final_price && (
                                    <span className="text-[10px] font-medium text-slate-400 line-through">
                                      {formatCurrency(item.base_price)}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center bg-slate-50 rounded-md p-0.5 border border-slate-200">
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.uuid, item.quantity - 1)}
                                    disabled={isUpdating}
                                    className="size-6 rounded flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-30"
                                  >
                                    <Minus className="size-3" />
                                  </button>
                                  <div className="w-6 text-center">
                                      {isUpdating ? (
                                          <Loader2 className="size-2 animate-spin mx-auto text-primary" />
                                      ) : (
                                        <span className="font-bold text-[11px] text-slate-900">
                                            {item.quantity}
                                        </span>
                                      )}
                                  </div>
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.uuid, item.quantity + 1)}
                                    disabled={isUpdating}
                                    className="size-6 rounded flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-30"
                                  >
                                    <Plus className="size-3" />
                                  </button>
                                </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-bold">
                      {formatCurrency(cart.total_base_amount)}
                    </span>
                  </div>
                  {cart.total_discount_amount > 0 && (
                    <div className="flex justify-between items-center text-sm font-medium text-emerald-600">
                      <span>Discount</span>
                      <span className="font-bold">
                        -{formatCurrency(cart.total_discount_amount)}
                      </span>
                    </div>
                  )}
                  <Separator className="bg-slate-50" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-lg font-bold text-slate-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatCurrency(cart.total_final_amount)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 rounded-lg bg-primary text-white font-bold text-sm shadow-md shadow-primary/10"
                  >
                    Go to Cart
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={closeMiniCart}
                    className="w-full h-10 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900"
                  >
                    Keep Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
