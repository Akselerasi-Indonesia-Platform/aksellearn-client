import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Heart, PlayCircle, Loader2, Trash2 } from 'lucide-react'
import { userWishlistService } from '@/services/user/wishlist.service'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

function WishlistPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addToCart, isAdding } = useCart()

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['user', 'wishlist'],
    queryFn: () => userWishlistService.getWishlist(),
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => userWishlistService.removeItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'wishlist'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-20"
    >
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          My Wishlist
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Courses you've saved for later. Ready to start learning?
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center space-y-6 bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
          <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
            <Heart className="size-10" />
          </div>
          <p className="text-slate-500 font-medium italic">
            Your wishlist is empty. Explore our curriculum and save courses you're interested in.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            className="rounded-xl font-bold border-slate-200 px-8 mt-4"
          >
            Explore Curriculum
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item: any) => (
            <div
              key={item.uuid}
              className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-500"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={item.course?.thumbnail}
                  alt={item.course?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <button
                  onClick={() => removeMutation.mutate(item.id)}
                  className="absolute top-4 right-4 size-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                  disabled={removeMutation.isPending}
                >
                  {removeMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider mb-3">
                    {item.course?.category?.name || 'Course'}
                  </Badge>
                  <h3 className="font-bold text-slate-800 tracking-tight leading-snug line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors cursor-pointer"
                      onClick={() => navigate({ to: '/course/$courseSlug', params: { courseSlug: item.course?.slug || item.course?.uuid } })}
                  >
                    {item.course?.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-black text-lg text-slate-900 tracking-tight">
                    {formatCurrency(item.course?.price || 0)}
                  </span>
                  <div className="flex items-center text-slate-400 font-medium">
                    <PlayCircle className="size-4 mr-1.5" />
                    {item.course?.stats?.total_modules || 0} Modules
                  </div>
                </div>

                <Button
                  onClick={() => {
                    addToCart({ id: item.course.uuid, type: 'course', quantity: 1 })
                  }}
                  disabled={isAdding}
                  className="w-full h-12 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  {isAdding ? <Loader2 className="size-4 animate-spin" /> : 'Enroll Now'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export const Route = createFileRoute('/student/wishlist')({
  component: WishlistPage,
})
