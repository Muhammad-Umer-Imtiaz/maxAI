'use client'

import { useState, useEffect } from 'react'
import { RequirePlanAccess } from '../../lib/RequirePlanAccess'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import { fetchUserFitnessPrograms } from '@/app/(frontend)/lib/fetchFitnessPrograms'
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Zap,
  Download,
  Loader2,
} from 'lucide-react'
import { generatePDF } from '@/lib/pdf-generator'

interface Exercise {
  name: string
  sets?: number | { $numberInt: string }
  reps: string
  weight: string
  restTime: string
  notes: string
  duration?: string
  intensity?: string
}

interface WorkoutDay {
  day: string
  workoutType: string
  exercises: Exercise[]
  duration: string
}

interface WorkoutPlan {
  overview: string
  duration: string
  frequency: string
  weeklySchedule: WorkoutDay[]
  progressionNotes: string
  safetyTips: string[]
}

interface Meal {
  meal: string
  calories: number | { $numberInt: string }
  protein: string
  carbs: string
  fats: string
}

interface Snack {
  snack: string
  calories: number | { $numberInt: string }
  timing: string
}

interface MealPlan {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snacks: Snack[]
}

interface DietPlan {
  overview: string
  calorieTarget: string
  macroBreakdown: {
    protein: string
    carbohydrates: string
    fats: string
  }
  mealPlan: MealPlan
  hydrationGoal: string
  supplementRecommendations: string[]
  nutritionTips: string[]
}

interface FitnessProgram {
  id: string
  workoutPlan: WorkoutPlan
  dietPlan: DietPlan
  generatedAt: string
  createdAt: string
}

export default function PlanSummaryPage() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<FitnessProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [openProgram, setOpenProgram] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'workout' | 'meal'>('workout')
  const [openDay, setOpenDay] = useState<string | null>(null)
  const [openExercise, setOpenExercise] = useState<string | null>(null)
  const [openMealType, setOpenMealType] = useState<string | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null)

  useEffect(() => {
    const loadPrograms = async () => {
      if (user?.email) {
        const fetchedPrograms = await fetchUserFitnessPrograms(user.email)
        setPrograms(fetchedPrograms)
      }
      setLoading(false)
    }

    loadPrograms()
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSetsValue = (sets: number | { $numberInt: string } | undefined): number => {
    if (typeof sets === 'number') return sets
    if (sets && typeof sets === 'object' && '$numberInt' in sets) {
      return parseInt(sets.$numberInt)
    }
    return 0
  }

  const getCaloriesValue = (calories: number | { $numberInt: string }): number => {
    if (typeof calories === 'number') return calories
    if (calories && typeof calories === 'object' && '$numberInt' in calories) {
      return parseInt(calories.$numberInt)
    }
    return 0
  }

  const toggleProgram = (programId: string) => {
    setOpenProgram(openProgram === programId ? null : programId)
    setOpenDay(null)
    setOpenExercise(null)
    setOpenMealType(null)
  }

  const toggleDay = (dayId: string) => {
    setOpenDay(openDay === dayId ? null : dayId)
    setOpenExercise(null)
  }

  const toggleExercise = (exerciseId: string) => {
    setOpenExercise(openExercise === exerciseId ? null : exerciseId)
  }

  const toggleMealType = (mealTypeId: string) => {
    setOpenMealType(openMealType === mealTypeId ? null : mealTypeId)
  }

  const handleDownloadPDF = async (program: FitnessProgram) => {
    if (!user) return

    setGeneratingPDF(program.id)
    try {
      const success = await generatePDF(program, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })

      if (!success) {
        // You can add a toast notification here
        console.error('Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setGeneratingPDF(null)
    }
  }

  if (loading) {
    return (
      <RequirePlanAccess>
        <div className="min-h-screen bg-hero-gradient p-6">
          <div className="max-w-6xl mx-auto">
            <div className="glass-card rounded-2xl p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-maxfit-medium-grey/20 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-maxfit-medium-grey/20 rounded w-2/3 mb-8"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-maxfit-medium-grey/10 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </RequirePlanAccess>
    )
  }

  return (
    <RequirePlanAccess>
      <div className="min-h-screen bg-hero-gradient p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-maxfit-white mb-2">
              Plan <span className="text-maxfit-neon-green text-glow">Summary</span>
            </h1>
            <p className="text-maxfit-medium-grey text-lg">
              View your complete AI-generated fitness programs with workout and nutrition plans
            </p>
          </div>

          {programs.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Target className="w-16 h-16 text-maxfit-medium-grey mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-maxfit-white mb-2">No Fitness Plans Yet</h3>
              <p className="text-maxfit-medium-grey mb-6">
                Start a conversation with our AI assistant to generate your first personalized
                fitness program with workout and nutrition plans.
              </p>
              <button className="btn-neon px-6 py-3 rounded-lg" >Generate Fitness Plan</button>
            </div>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <div key={program.id} className="glass-card rounded-2xl overflow-hidden">
                  {/* Program Header */}
                  <div className="p-6 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors border-b border-maxfit-medium-grey/20">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center space-x-4 flex-1"
                        onClick={() => toggleProgram(program.id)}
                      >
                        <div className="flex-shrink-0">
                          {openProgram === program.id ? (
                            <ChevronDown className="w-6 h-6 text-maxfit-neon-green" />
                          ) : (
                            <ChevronRight className="w-6 h-6 text-maxfit-medium-grey" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="w-4 h-4 text-maxfit-neon-green" />
                            <span className="text-maxfit-white font-semibold">
                              {formatDate(program.createdAt)}
                            </span>
                          </div>
                          <p className="text-maxfit-medium-grey text-sm line-clamp-2">
                            {program.workoutPlan?.overview ||
                              program.dietPlan?.overview ||
                              'Complete fitness program with workout and nutrition plan'}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadPDF(program)
                          }}
                          disabled={generatingPDF === program.id}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium bg-gradient-to-r from-lime-400 to-emerald-500 text-black hover:from-lime-500 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          {generatingPDF === program.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </button>

                        <div className="text-right">
                          <div className="text-maxfit-neon-green font-semibold">
                            {program.workoutPlan?.duration ||
                              program.dietPlan?.calorieTarget ||
                              'Complete Plan'}
                          </div>
                          <div className="text-maxfit-medium-grey text-sm">Workout & Nutrition</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Program Details */}
                  {openProgram === program.id && (
                    <div className="p-6 bg-maxfit-darker-grey/30">
                      {/* Tab Navigation */}
                      <div
                        role="tablist"
                        aria-label="Plan view tabs"
                        className="relative mx-auto mb-6 w-full max-w-md"
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            setActiveTab((prev) => (prev === 'workout' ? 'meal' : 'workout'))
                          }
                        }}
                      >
                        <div className="relative grid grid-cols-2 rounded-2xl p-1 border border-maxfit-medium-grey/30 overflow-hidden backdrop-blur supports-[backdrop-filter]:bg-black/20 bg-maxfit-darker-grey/50 shadow-inner">
                          {/* Visible sliding highlight */}
                          <span
                            aria-hidden
                            className={`pointer-events-none absolute inset-y-1 w-1/2 rounded-xl shadow-lg transition-[transform,width] duration-300 ease-out transform-gpu will-change-transform z-0 bg-gradient-to-r from-lime-400 to-emerald-500`}
                            style={{
                              transform:
                                activeTab === 'workout' ? 'translateX(0%)' : 'translateX(100%)',
                            }}
                          />
                          <button
                            id="workout-tab"
                            role="tab"
                            aria-controls="workout-panel"
                            aria-selected={activeTab === 'workout'}
                            className={`relative z-[1] flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-lime-400/60 ${
                              activeTab === 'workout'
                                ? 'text-black'
                                : 'text-maxfit-medium-grey hover:text-maxfit-white'
                            }`}
                            onClick={() => setActiveTab('workout')}
                            type="button"
                          >
                            <Dumbbell className="w-4 h-4" />
                            Workout Plan
                          </button>
                          <button
                            id="meal-tab"
                            role="tab"
                            aria-controls="meal-panel"
                            aria-selected={activeTab === 'meal'}
                            className={`relative z-[1] flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-lime-400/60 ${
                              activeTab === 'meal'
                                ? 'text-black'
                                : 'text-maxfit-medium-grey hover:text-maxfit-white'
                            }`}
                            onClick={() => setActiveTab('meal')}
                            type="button"
                          >
                            <UtensilsCrossed className="w-4 h-4" />
                            Nutrition Plan
                          </button>
                        </div>
                      </div>
                      {/* End Tab Navigation */}

                      {/* Workout Plan Tab */}
                      {activeTab === 'workout' && program.workoutPlan && (
                        <div
                          id="workout-panel"
                          role="tabpanel"
                          aria-labelledby="workout-tab"
                          className="animate-fade-in"
                        >
                          {/* Program Overview */}
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-maxfit-white mb-3">
                              Program Overview
                            </h3>
                            <p className="text-maxfit-medium-grey leading-relaxed">
                              {program.workoutPlan.overview}
                            </p>
                          </div>

                          {/* Weekly Schedule */}
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-maxfit-white mb-3">
                              Weekly Schedule
                            </h3>
                            <div className="space-y-2">
                              {program.workoutPlan.weeklySchedule.map((day, dayIndex) => {
                                const dayId = `${program.id}-day-${dayIndex}`
                                return (
                                  <div
                                    key={dayIndex}
                                    className="glass-card rounded-xl overflow-hidden"
                                  >
                                    <div
                                      className="p-4 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors"
                                      onClick={() => toggleDay(dayId)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <div className="flex-shrink-0">
                                            {openDay === dayId ? (
                                              <ChevronDown className="w-5 h-5 text-maxfit-neon-green" />
                                            ) : (
                                              <ChevronRight className="w-5 h-5 text-maxfit-medium-grey" />
                                            )}
                                          </div>
                                          <div>
                                            <div className="text-maxfit-white font-semibold">
                                              {day.day}
                                            </div>
                                            <div className="text-maxfit-medium-grey text-sm">
                                              {day.workoutType}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm">
                                          <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4 text-maxfit-neon-green" />
                                            <span className="text-maxfit-medium-grey">
                                              {day.duration}
                                            </span>
                                          </div>
                                          <div className="text-maxfit-neon-green font-medium">
                                            {day.exercises.length} exercises
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Day Exercises */}
                                    {openDay === dayId && (
                                      <div className="p-4 pt-0 bg-maxfit-darker-grey/20">
                                        <div className="space-y-2">
                                          {day.exercises.map((exercise, exerciseIndex) => {
                                            const exerciseId = `${dayId}-exercise-${exerciseIndex}`
                                            return (
                                              <div
                                                key={exerciseIndex}
                                                className="glass-card rounded-lg overflow-hidden"
                                              >
                                                <div
                                                  className="p-3 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors"
                                                  onClick={() => toggleExercise(exerciseId)}
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                      <div className="flex-shrink-0">
                                                        {openExercise === exerciseId ? (
                                                          <ChevronDown className="w-4 h-4 text-maxfit-neon-green" />
                                                        ) : (
                                                          <ChevronRight className="w-4 h-4 text-maxfit-medium-grey" />
                                                        )}
                                                      </div>
                                                      <div>
                                                        <div className="text-maxfit-white font-medium">
                                                          {exercise.name}
                                                        </div>
                                                        {exercise.sets && (
                                                          <div className="text-maxfit-medium-grey text-sm">
                                                            {getSetsValue(exercise.sets)} sets ×{' '}
                                                            {exercise.reps}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <div className="text-right">
                                                      <div className="text-maxfit-neon-green text-sm">
                                                        {exercise.weight}
                                                      </div>
                                                      {exercise.duration && (
                                                        <div className="text-maxfit-medium-grey text-xs">
                                                          {exercise.duration}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Exercise Details */}
                                                {openExercise === exerciseId && (
                                                  <div className="p-3 pt-0 bg-maxfit-darker-grey/30">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                      {exercise.sets && (
                                                        <div>
                                                          <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                                            Sets
                                                          </div>
                                                          <div className="text-maxfit-white font-semibold">
                                                            {getSetsValue(exercise.sets)}
                                                          </div>
                                                        </div>
                                                      )}
                                                      <div>
                                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                                          Reps
                                                        </div>
                                                        <div className="text-maxfit-white font-semibold">
                                                          {exercise.reps}
                                                        </div>
                                                      </div>
                                                      <div>
                                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                                          Weight
                                                        </div>
                                                        <div className="text-maxfit-white font-semibold">
                                                          {exercise.weight}
                                                        </div>
                                                      </div>
                                                      {exercise.restTime && (
                                                        <div>
                                                          <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                                            Rest
                                                          </div>
                                                          <div className="text-maxfit-white font-semibold">
                                                            {exercise.restTime}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                    {exercise.notes && (
                                                      <div className="flex items-start space-x-2">
                                                        <AlertCircle className="w-4 h-4 text-maxfit-neon-green mt-0.5 flex-shrink-0" />
                                                        <p className="text-maxfit-medium-grey text-sm">
                                                          {exercise.notes}
                                                        </p>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Progression Notes & Safety Tips */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-lg font-bold text-maxfit-white mb-2">
                                Progression Notes
                              </h4>
                              <p className="text-maxfit-medium-grey text-sm">
                                {program.workoutPlan.progressionNotes}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-maxfit-white mb-2">
                                Safety Tips
                              </h4>
                              <ul className="space-y-1">
                                {program.workoutPlan.safetyTips.map((tip, index) => (
                                  <li
                                    key={index}
                                    className="text-maxfit-medium-grey text-sm flex items-start space-x-2"
                                  >
                                    <span className="text-maxfit-neon-green">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Nutrition Plan Tab */}
                      {activeTab === 'meal' && program.dietPlan && (
                        <div
                          id="meal-panel"
                          role="tabpanel"
                          aria-labelledby="meal-tab"
                          className="animate-fade-in"
                        >
                          {/* Nutrition Overview */}
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-maxfit-white mb-3">
                              Nutrition Overview
                            </h3>
                            <p className="text-maxfit-medium-grey leading-relaxed mb-4">
                              {program.dietPlan.overview}
                            </p>

                            {/* Macro Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="glass-card rounded-xl p-4 text-center">
                                <Zap className="w-6 h-6 text-maxfit-neon-green mx-auto mb-2" />
                                <div className="text-maxfit-white font-bold text-lg">
                                  {program.dietPlan.calorieTarget}
                                </div>
                                <div className="text-maxfit-medium-grey text-sm">Calories</div>
                              </div>
                              <div className="glass-card rounded-xl p-4 text-center">
                                <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-2"></div>
                                <div className="text-maxfit-white font-bold text-lg">
                                  {program.dietPlan.macroBreakdown.protein}
                                </div>
                                <div className="text-maxfit-medium-grey text-sm">Protein</div>
                              </div>
                              <div className="glass-card rounded-xl p-4 text-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-2"></div>
                                <div className="text-maxfit-white font-bold text-lg">
                                  {program.dietPlan.macroBreakdown.carbohydrates}
                                </div>
                                <div className="text-maxfit-medium-grey text-sm">Carbs</div>
                              </div>
                              <div className="glass-card rounded-xl p-4 text-center">
                                <div className="w-6 h-6 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                                <div className="text-maxfit-white font-bold text-lg">
                                  {program.dietPlan.macroBreakdown.fats}
                                </div>
                                <div className="text-maxfit-medium-grey text-sm">Fats</div>
                              </div>
                            </div>
                          </div>

                          {/* Meal Plan */}
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-maxfit-white mb-3">
                              Daily Meal Plan
                            </h3>
                            <div className="space-y-2">
                              {/* Breakfast */}
                              <div className="glass-card rounded-xl overflow-hidden">
                                <div
                                  className="p-4 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors"
                                  onClick={() => toggleMealType(`${program.id}-breakfast`)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-shrink-0">
                                        {openMealType === `${program.id}-breakfast` ? (
                                          <ChevronDown className="w-5 h-5 text-maxfit-neon-green" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5 text-maxfit-medium-grey" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-maxfit-white font-semibold">
                                          Breakfast
                                        </div>
                                        <div className="text-maxfit-medium-grey text-sm line-clamp-1">
                                          {program.dietPlan.mealPlan.breakfast.meal}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-maxfit-neon-green font-semibold">
                                        {getCaloriesValue(
                                          program.dietPlan.mealPlan.breakfast.calories,
                                        )}{' '}
                                        cal
                                      </div>
                                      <div className="text-maxfit-medium-grey text-sm">
                                        {program.dietPlan.mealPlan.breakfast.protein} protein
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {openMealType === `${program.id}-breakfast` && (
                                  <div className="p-4 pt-0 bg-maxfit-darker-grey/20">
                                    <div className="mb-3">
                                      <p className="text-maxfit-medium-grey">
                                        {program.dietPlan.mealPlan.breakfast.meal}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Calories
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {getCaloriesValue(
                                            program.dietPlan.mealPlan.breakfast.calories,
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Protein
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {program.dietPlan.mealPlan.breakfast.protein}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Carbs
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {program.dietPlan.mealPlan.breakfast.carbs}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Fats
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {program.dietPlan.mealPlan.breakfast.fats}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Lunch */}
                              <div className="glass-card rounded-xl overflow-hidden">
                                <div
                                  className="p-4 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors"
                                  onClick={() => toggleMealType(`${program.id}-lunch`)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-shrink-0">
                                        {openMealType === `${program.id}-lunch` ? (
                                          <ChevronDown className="w-5 h-5 text-maxfit-neon-green" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5 text-maxfit-medium-grey" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-maxfit-white font-semibold">Lunch</div>
                                        <div className="text-maxfit-medium-grey text-sm line-clamp-1">
                                          {program.dietPlan.mealPlan.lunch.meal}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-maxfit-neon-green font-semibold">
                                        {getCaloriesValue(program.dietPlan.mealPlan.lunch.calories)}{' '}
                                        cal
                                      </div>
                                      <div className="text-maxfit-medium-grey text-sm">
                                        {program.dietPlan.mealPlan.lunch.protein} protein
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {openMealType === `${program.id}-lunch` && (
                                  <div className="p-4 pt-0 bg-maxfit-darker-grey/20">
                                    <div className="mb-3">
                                      <p className="text-maxfit-medium-grey">
                                        {program.dietPlan.mealPlan.lunch.meal}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Calories
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {getCaloriesValue(
                                            program.dietPlan.mealPlan.lunch.calories,
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Protein
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {program.dietPlan.mealPlan.lunch.protein}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Carbs
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {program.dietPlan.mealPlan.lunch.carbs}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Fats
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {program.dietPlan.mealPlan.lunch.fats}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Dinner */}
                              <div className="glass-card rounded-xl overflow-hidden">
                                <div
                                  className="p-4 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors"
                                  onClick={() => toggleMealType(`${program.id}-dinner`)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-shrink-0">
                                        {openMealType === `${program.id}-dinner` ? (
                                          <ChevronDown className="w-5 h-5 text-maxfit-neon-green" />
                                        ) : (
                                          <ChevronRight className="w-5 h-5 text-maxfit-medium-grey" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-maxfit-white font-semibold">
                                          Dinner
                                        </div>
                                        <div className="text-maxfit-medium-grey text-sm line-clamp-1">
                                          {program.dietPlan.mealPlan.dinner.meal}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-maxfit-neon-green font-semibold">
                                        {getCaloriesValue(
                                          program.dietPlan.mealPlan.dinner.calories,
                                        )}{' '}
                                        cal
                                      </div>
                                      <div className="text-maxfit-medium-grey text-sm">
                                        {program.dietPlan.mealPlan.dinner.protein} protein
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {openMealType === `${program.id}-dinner` && (
                                  <div className="p-4 pt-0 bg-maxfit-darker-grey/20">
                                    <div className="mb-3">
                                      <p className="text-maxfit-medium-grey">
                                        {program.dietPlan.mealPlan.dinner.meal}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Calories
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {getCaloriesValue(
                                            program.dietPlan.mealPlan.dinner.calories,
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Protein
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {program.dietPlan.mealPlan.dinner.protein}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Carbs
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {program.dietPlan.mealPlan.dinner.carbs}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide">
                                          Fats
                                        </div>
                                        <div className="text-maxfit-white font-semibold">
                                          {program.dietPlan.mealPlan.dinner.fats}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Snacks */}
                              {program.dietPlan.mealPlan.snacks.length > 0 && (
                                <div className="glass-card rounded-xl overflow-hidden">
                                  <div
                                    className="p-4 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors"
                                    onClick={() => toggleMealType(`${program.id}-snacks`)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                          {openMealType === `${program.id}-snacks` ? (
                                            <ChevronDown className="w-5 h-5 text-maxfit-neon-green" />
                                          ) : (
                                            <ChevronRight className="w-5 h-5 text-maxfit-medium-grey" />
                                          )}
                                        </div>
                                        <div>
                                          <div className="text-maxfit-white font-semibold">
                                            Snacks
                                          </div>
                                          <div className="text-maxfit-medium-grey text-sm">
                                            {program.dietPlan.mealPlan.snacks.length} snack
                                            {program.dietPlan.mealPlan.snacks.length > 1 ? 's' : ''}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-maxfit-neon-green font-semibold">
                                          {program.dietPlan.mealPlan.snacks.reduce(
                                            (total, snack) =>
                                              total + getCaloriesValue(snack.calories),
                                            0,
                                          )}{' '}
                                          cal
                                        </div>
                                        <div className="text-maxfit-medium-grey text-sm">Total</div>
                                      </div>
                                    </div>
                                  </div>

                                  {openMealType === `${program.id}-snacks` && (
                                    <div className="p-4 pt-0 bg-maxfit-darker-grey/20">
                                      <div className="space-y-3">
                                        {program.dietPlan.mealPlan.snacks.map((snack, index) => (
                                          <div key={index} className="glass-card rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                              <div>
                                                <div className="text-maxfit-white font-medium">
                                                  {snack.snack}
                                                </div>
                                                <div className="text-maxfit-medium-grey text-sm">
                                                  {snack.timing}
                                                </div>
                                              </div>
                                              <div className="text-maxfit-neon-green font-semibold">
                                                {getCaloriesValue(snack.calories)} cal
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Additional Information */}
                          <div className="grid md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="text-lg font-bold text-maxfit-white mb-2 flex items-center">
                                <Droplets className="w-5 h-5 text-maxfit-neon-green mr-2" />
                                Hydration Goal
                              </h4>
                              <p className="text-maxfit-medium-grey text-sm">
                                {program.dietPlan.hydrationGoal}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-maxfit-white mb-2">
                                Supplements
                              </h4>
                              <ul className="space-y-1">
                                {program.dietPlan.supplementRecommendations.map(
                                  (supplement, index) => (
                                    <li
                                      key={index}
                                      className="text-maxfit-medium-grey text-sm flex items-start space-x-2"
                                    >
                                      <span className="text-maxfit-neon-green">•</span>
                                      <span>{supplement}</span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-maxfit-white mb-2">
                                Nutrition Tips
                              </h4>
                              <ul className="space-y-1">
                                {program.dietPlan.nutritionTips.slice(0, 3).map((tip, index) => (
                                  <li
                                    key={index}
                                    className="text-maxfit-medium-grey text-sm flex items-start space-x-2"
                                  >
                                    <span className="text-maxfit-neon-green">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequirePlanAccess>
  )
}
