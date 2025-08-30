import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface FitnessProgram {
  id: string
  workoutPlan: any
  dietPlan: any
  generatedAt: string
  createdAt: string
}

export const generatePDF = async (
  program: FitnessProgram,
  userInfo: { firstName: string; lastName: string; email: string },
) => {
  try {
    // Create a temporary container for PDF content
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '210mm' // A4 width
    container.style.maxWidth = '210mm'
    container.style.minHeight = 'auto' // Let content determine height
    container.style.padding = '20mm'
    container.style.fontFamily = '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
    container.style.backgroundColor = '#ffffff'
    container.style.color = '#333333'
    container.style.boxSizing = 'border-box'
    container.style.fontSize = '14px'
    container.style.lineHeight = '1.5'
    document.body.appendChild(container)

    // Generate PDF content
    container.innerHTML = generatePDFContent(program, userInfo)

    // Wait for content to render
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Get actual content height
    const contentHeight = container.scrollHeight

    // Convert to canvas with high DPI
    const canvas = await html2canvas(container, {
      scale: 2, // Good balance of quality and performance
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: container.offsetWidth,
      height: contentHeight,
      windowWidth: container.offsetWidth,
      windowHeight: contentHeight,
      scrollX: 0,
      scrollY: 0,
      removeContainer: false,
    })

    // Remove temporary container
    document.body.removeChild(container)

    // Create PDF with exact dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = 210 // A4 width in mm
    const pdfHeight = 297 // A4 height in mm

    const imgData = canvas.toDataURL('image/png', 1.0) // Maximum quality
    const imgWidthMM = pdfWidth
    const imgHeightMM = (canvas.height * pdfWidth) / canvas.width

    // Add the image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMM, imgHeightMM, '', 'FAST')

    // Handle multiple pages if content is longer than one page
    if (imgHeightMM > pdfHeight) {
      const totalPages = Math.ceil(imgHeightMM / pdfHeight)

      for (let i = 1; i < totalPages; i++) {
        pdf.addPage('a4', 'portrait')
        const yOffset = -i * pdfHeight
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidthMM, imgHeightMM, '', 'FAST')
      }
    }

    // Download the PDF
    const fileName = `MaxFitAI_Plan_${new Date(program.createdAt)
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '-')}.pdf`

    pdf.save(fileName)

    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    return false
  }
}

const generatePDFContent = (
  program: FitnessProgram,
  userInfo: { firstName: string; lastName: string; email: string },
): string => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  return `
    <div style="
      width: 100%; 
      margin: 0; 
      padding: 0; 
      background: #ffffff; 
      color: #333333; 
      line-height: 1.5; 
      font-size: 14px;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    ">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; padding-bottom: 25px; border-bottom: 3px solid #00ff88;">
        <h1 style="color: #00ff88; font-size: 36px; margin: 0 0 10px 0; font-weight: 800; letter-spacing: 2px;">MAXFIT AI</h1>
        <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">Personalized Fitness Plan</h2>
        <div style="color: #666666; font-size: 14px; line-height: 1.6;">
          <div style="margin: 5px 0;"><strong style="color: #444444;">Generated for:</strong> ${userInfo.firstName} ${userInfo.lastName}</div>
          <div style="margin: 5px 0;"><strong style="color: #444444;">Email:</strong> ${userInfo.email}</div>
          <div style="margin: 5px 0;"><strong style="color: #444444;">Generated on:</strong> ${formatDate(program.createdAt)}</div>
        </div>
      </div>

      ${
        program.workoutPlan
          ? `
      <!-- Workout Plan Section -->
      <div style="margin-bottom: 40px;">
        <h2 style="color: #333333; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #00ff88; padding-bottom: 10px; font-weight: 700;">
          🏋️‍♂️ Workout Plan
        </h2>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333333; font-size: 18px; margin-bottom: 10px; font-weight: 600;">Program Overview</h3>
          <p style="color: #555555; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">${program.workoutPlan.overview}</p>
          
          <div style="display: flex; justify-content: space-between; gap: 15px; margin-bottom: 25px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 2px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="color: #00ff88; font-weight: 700; font-size: 16px;">${program.workoutPlan.duration}</div>
              <div style="color: #666666; font-size: 12px; margin-top: 5px;">Duration</div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 2px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="color: #00ff88; font-weight: 700; font-size: 16px;">${program.workoutPlan.frequency}</div>
              <div style="color: #666666; font-size: 12px; margin-top: 5px;">Frequency</div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 2px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="color: #00ff88; font-weight: 700; font-size: 16px;">${program.workoutPlan.weeklySchedule?.length || 0}</div>
              <div style="color: #666666; font-size: 12px; margin-top: 5px;">Workout Days</div>
            </div>
          </div>
        </div>

        ${
          program.workoutPlan.weeklySchedule
            ? program.workoutPlan.weeklySchedule
                .map(
                  (day: any, index: number) => `
          <div style="margin-bottom: 25px; background: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="color: #333333; font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; font-weight: 600;">
              <span style="background: #00ff88; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; margin-right: 12px;">${index + 1}</span>
              ${day.day} - ${day.workoutType}
            </h4>
            
            ${
              day.exercises
                ? day.exercises
                    .map(
                      (exercise: any) => `
              <div style="margin-bottom: 15px; padding: 15px; background: #ffffff; border-radius: 10px; border-left: 4px solid #00ff88; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h5 style="color: #333333; font-size: 16px; margin-bottom: 10px; font-weight: 600;">${exercise.name}</h5>
                <div style="display: flex; justify-content: space-between; font-size: 13px; flex-wrap: wrap; gap: 10px;">
                  ${exercise.sets ? `<div style="background: #f1f3f4; padding: 6px 12px; border-radius: 6px;"><span style="color: #666666;">Sets:</span> <span style="color: #00ff88; font-weight: 600;">${getSetsValue(exercise.sets)}</span></div>` : ''}
                  <div style="background: #f1f3f4; padding: 6px 12px; border-radius: 6px;"><span style="color: #666666;">Reps:</span> <span style="color: #00ff88; font-weight: 600;">${exercise.reps}</span></div>
                  <div style="background: #f1f3f4; padding: 6px 12px; border-radius: 6px;"><span style="color: #666666;">Weight:</span> <span style="color: #00ff88; font-weight: 600;">${exercise.weight}</span></div>
                  <div style="background: #f1f3f4; padding: 6px 12px; border-radius: 6px;"><span style="color: #666666;">Rest:</span> <span style="color: #00ff88; font-weight: 600;">${exercise.restTime}</span></div>
                </div>
                ${exercise.notes ? `<div style="margin-top: 12px; color: #555555; font-size: 13px; font-style: italic; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #ffc107;">💡 ${exercise.notes}</div>` : ''}
              </div>
            `,
                    )
                    .join('')
                : ''
            }
          </div>
        `,
                )
                .join('')
            : ''
        }

        <div style="margin-top: 30px; display: flex; gap: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; flex: 1; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="color: #333333; font-size: 16px; margin-bottom: 12px; font-weight: 600;">📈 Progression Notes</h4>
            <p style="color: #555555; font-size: 13px; line-height: 1.5;">${program.workoutPlan.progressionNotes}</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; flex: 1; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="color: #333333; font-size: 16px; margin-bottom: 12px; font-weight: 600;">🛡️ Safety Tips</h4>
            <ul style="color: #555555; font-size: 13px; padding-left: 20px; margin: 0; line-height: 1.5;">
              ${
                program.workoutPlan.safetyTips
                  ? program.workoutPlan.safetyTips
                      .slice(0, 4)
                      .map((tip: string) => `<li style="margin-bottom: 6px;">${tip}</li>`)
                      .join('')
                  : ''
              }
            </ul>
          </div>
        </div>
      </div>
      `
          : ''
      }

      ${
        program.dietPlan
          ? `
      <!-- Nutrition Plan Section -->
      <div style="margin-bottom: 40px;">
        <h2 style="color: #333333; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #00ff88; padding-bottom: 10px; font-weight: 700;">
          🍽️ Nutrition Plan
        </h2>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333333; font-size: 18px; margin-bottom: 10px; font-weight: 600;">Nutrition Overview</h3>
          <p style="color: #555555; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">${program.dietPlan.overview}</p>
          
          <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 25px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 2px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="color: #00ff88; font-weight: 700; font-size: 16px;">${program.dietPlan.calorieTarget}</div>
              <div style="color: #666666; font-size: 12px; margin-top: 5px;">Calories</div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 2px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="color: #00ff88; font-weight: 700; font-size: 16px;">${program.dietPlan.macroBreakdown?.protein}</div>
              <div style="color: #666666; font-size: 12px; margin-top: 5px;">Protein</div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 2px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="color: #00ff88; font-weight: 700; font-size: 16px;">${program.dietPlan.macroBreakdown?.carbohydrates}</div>
              <div style="color: #666666; font-size: 12px; margin-top: 5px;">Carbs</div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; flex: 1; border: 2px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="color: #00ff88; font-weight: 700; font-size: 16px;">${program.dietPlan.macroBreakdown?.fats}</div>
              <div style="color: #666666; font-size: 12px; margin-top: 5px;">Fats</div>
            </div>
          </div>
        </div>

        <h3 style="color: #333333; font-size: 18px; margin-bottom: 15px; font-weight: 600;">Daily Meal Plan</h3>
        
        ${
          program.dietPlan.mealPlan
            ? ['breakfast', 'lunch', 'dinner']
                .map((mealType: string) => {
                  const meal = program.dietPlan.mealPlan[mealType]
                  if (!meal) return ''

                  return `
            <div style="margin-bottom: 20px; background: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h4 style="color: #333333; font-size: 18px; margin-bottom: 12px; text-transform: capitalize; font-weight: 600;">🍳 ${mealType}</h4>
              <p style="color: #333333; margin-bottom: 15px; font-weight: 500; font-size: 14px; line-height: 1.5;">${meal.meal}</p>
              <div style="display: flex; justify-content: space-between; font-size: 13px; flex-wrap: wrap; gap: 10px;">
                <div style="background: #ffffff; padding: 10px 15px; border-radius: 8px; text-align: center; flex: 1; min-width: 80px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <div style="color: #00ff88; font-weight: 700; font-size: 15px;">${getCaloriesValue(meal.calories)}</div>
                  <div style="color: #666666; font-size: 11px;">Calories</div>
                </div>
                <div style="background: #ffffff; padding: 10px 15px; border-radius: 8px; text-align: center; flex: 1; min-width: 80px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <div style="color: #00ff88; font-weight: 700; font-size: 15px;">${meal.protein}</div>
                  <div style="color: #666666; font-size: 11px;">Protein</div>
                </div>
                <div style="background: #ffffff; padding: 10px 15px; border-radius: 8px; text-align: center; flex: 1; min-width: 80px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <div style="color: #00ff88; font-weight: 700; font-size: 15px;">${meal.carbs}</div>
                  <div style="color: #666666; font-size: 11px;">Carbs</div>
                </div>
                <div style="background: #ffffff; padding: 10px 15px; border-radius: 8px; text-align: center; flex: 1; min-width: 80px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <div style="color: #00ff88; font-weight: 700; font-size: 15px;">${meal.fats}</div>
                  <div style="color: #666666; font-size: 11px;">Fats</div>
                </div>
              </div>
            </div>
          `
                })
                .join('')
            : ''
        }

        <div style="display: flex; gap: 20px; margin-top: 30px; flex-wrap: wrap;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; flex: 1; min-width: 250px; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="color: #333333; font-size: 16px; margin-bottom: 12px; font-weight: 600;">💧 Hydration Guidelines</h4>
            <p style="color: #555555; font-size: 13px; line-height: 1.5;">${program.dietPlan.hydrationGoal}</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; flex: 1; min-width: 250px; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="color: #333333; font-size: 16px; margin-bottom: 12px; font-weight: 600;">💊 Supplement Recommendations</h4>
            <ul style="color: #555555; font-size: 13px; padding-left: 20px; margin: 0; line-height: 1.5;">
              ${
                program.dietPlan.supplementRecommendations
                  ? program.dietPlan.supplementRecommendations
                      .slice(0, 5)
                      .map(
                        (supplement: string) =>
                          `<li style="margin-bottom: 5px;">${supplement}</li>`,
                      )
                      .join('')
                  : ''
              }
            </ul>
          </div>
        </div>
      </div>
      `
          : ''
      }
    </div>
  `
}
