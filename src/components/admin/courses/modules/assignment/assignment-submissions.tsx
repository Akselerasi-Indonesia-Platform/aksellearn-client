import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Download, CheckCircle, Clock, XCircle, Search } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { adminAssignmentService, AssignmentSubmission } from '@/services/admin/assignment.service'

interface AssignmentSubmissionsProps {
  courseUuid: string
  moduleUuid: string
  assignmentUuid: string
}

export function AssignmentSubmissions({
  courseUuid,
  moduleUuid,
  assignmentUuid,
}: AssignmentSubmissionsProps) {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null)
  
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [isGrading, setIsGrading] = useState(false)

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const data = await adminAssignmentService.getSubmissions(courseUuid, moduleUuid, assignmentUuid)
      setSubmissions(data)
    } catch (error) {
      toast.error('Failed to load submissions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (assignmentUuid) {
      fetchSubmissions()
    }
  }, [assignmentUuid])

  const handleOpenGrade = (sub: AssignmentSubmission) => {
    setSelectedSubmission(sub)
    setGradeScore(sub.score?.toString() || '')
    setGradeFeedback(sub.feedback || '')
  }

  const handleSaveGrade = async (status: 'graded' | 'returned') => {
    if (!selectedSubmission) return

    const scoreNum = parseFloat(gradeScore)
    if (status === 'graded' && isNaN(scoreNum)) {
      toast.error('Please enter a valid score')
      return
    }

    setIsGrading(true)
    try {
      const updated = await adminAssignmentService.gradeSubmission(
        courseUuid,
        moduleUuid,
        assignmentUuid,
        selectedSubmission.uuid,
        {
          score: scoreNum,
          feedback: gradeFeedback,
          status,
        }
      )
      toast.success(`Submission ${status}`)
      setSubmissions(prev => prev.map(s => s.uuid === updated.uuid ? updated : s))
      setSelectedSubmission(null)
    } catch (error) {
      toast.error('Failed to grade submission')
    } finally {
      setIsGrading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-800">Student Submissions ({submissions.length})</h4>
        <Button variant="outline" size="sm" onClick={fetchSubmissions}>Refresh</Button>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-xl text-slate-500">
          No submissions yet
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.uuid} className="cursor-pointer hover:bg-slate-50" onClick={() => handleOpenGrade(sub)}>
                  <TableCell className="font-medium">
                    {sub.user?.name || 'Unknown Student'}
                    <div className="text-xs text-slate-400 font-normal">{sub.user?.email}</div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(sub.submitted_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {sub.status === 'pending' && <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>}
                    {sub.status === 'graded' && <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Graded</Badge>}
                    {sub.status === 'returned' && <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">Returned</Badge>}
                  </TableCell>
                  <TableCell className="font-bold text-slate-700">
                    {sub.score !== null && sub.score !== undefined ? sub.score : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold">
                      Grade
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grade Drawer */}
      <Drawer open={!!selectedSubmission} onOpenChange={(o) => !o && setSelectedSubmission(null)}>
        <DrawerContent className="max-h-[90vh]">
          <div className="mx-auto w-full max-w-2xl px-6 py-6">
            <DrawerHeader className="px-0 pt-0">
              <DrawerTitle className="text-2xl font-black">Grade Submission</DrawerTitle>
              <DrawerDescription>
                Review and grade {selectedSubmission?.user?.name}'s work.
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-6 py-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h5 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Submission Content</h5>
                <div className="text-slate-800 whitespace-pre-wrap break-words text-sm overflow-hidden">
                  {selectedSubmission?.content || <span className="italic text-slate-400">No text content provided</span>}
                </div>
                
                {selectedSubmission?.attachment_uuid && (
                  <div className="pt-4 border-t border-slate-200 mt-4">
                    <Button variant="outline" className="gap-2 font-bold text-slate-700 border-slate-300">
                      <Download className="size-4" /> Download Attachment
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-6 items-start">
                <div className="col-span-1 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Score</label>
                  <Input 
                    type="number" 
                    value={gradeScore} 
                    onChange={e => setGradeScore(e.target.value)} 
                    placeholder="E.g. 95"
                    className="font-bold text-lg h-12"
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Instructor Feedback</label>
                  <Textarea 
                    value={gradeFeedback} 
                    onChange={e => setGradeFeedback(e.target.value)} 
                    placeholder="Provide constructive feedback..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <DrawerFooter className="px-0 pb-0 gap-3 flex-row justify-end border-t border-slate-100 pt-6 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setSelectedSubmission(null)}
                disabled={isGrading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="gap-2"
                onClick={() => handleSaveGrade('returned')}
                disabled={isGrading}
              >
                {isGrading ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                Return for Revision
              </Button>
              <Button 
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleSaveGrade('graded')}
                disabled={isGrading}
              >
                {isGrading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                Publish Grade
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
