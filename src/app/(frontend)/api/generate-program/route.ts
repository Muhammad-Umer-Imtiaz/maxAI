import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import nodemailer from 'nodemailer'
// Update the imports
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

// Add the transporter (same as in your email.ts file)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Parse incoming body
    const body = await request.json()
    console.log('🔥 Raw Request Body:', JSON.stringify(body, null, 2))

    // Extract data directly from body (VAPI sends tool parameters in main body)
    const {
      name,
      email,
      age,
      weight,
      height,
      fitness_goal,
      injuries,
      fitness_level,
      workout_days,
      dietary_restrictions,
    } = body

    // Validate required fields
    if (!email || !name) {
      console.log('❌ Missing required fields:', { name, email })
      return NextResponse.json(
        {
          error: 'Missing required user information (name and email)',
          receivedData: body,
        },
        { status: 400 },
      )
    }

    console.log(`✅ Processing request for: ${name} (${email})`)

    // Create comprehensive AI prompt
    const prompt = `You are a professional fitness trainer creating a comprehensive fitness and nutrition program. Based on the following user information, create a detailed workout plan and diet plan.

User Information:
- Name: ${name}
- Age: ${age || 'Not specified'}
- Weight: ${weight || 'Not specified'}
- Height: ${height || 'Not specified'}
- Fitness Goals: ${fitness_goal || 'General fitness'}
- Injuries/Limitations: ${injuries || 'None specified'}
- Current Fitness Level: ${fitness_level || 'Beginner'}
- Workout Days Per Week: ${workout_days || 3}
- Dietary Restrictions: ${dietary_restrictions || 'None'}

Please create a structured JSON response with the following format:

{
  "workoutPlan": {
    "overview": "Brief overview of the workout plan",
    "duration": "Program duration (e.g., 12 weeks)",
    "frequency": "Workout frequency per week",
    "weeklySchedule": [
      {
        "day": "Monday",
        "workoutType": "Push Day / Cardio / Rest",
        "exercises": [
          {
            "name": "Exercise name",
            "sets": 3,
            "reps": "8-12",
            "weight": "bodyweight/light/moderate/heavy",
            "restTime": "60-90 seconds",
            "notes": "Form tips or modifications"
          }
        ],
        "duration": "45-60 minutes"
      }
    ],
    "progressionNotes": "How to progress over time",
    "safetyTips": ["Important safety considerations"]
  },
  "dietPlan": {
    "overview": "Brief overview of the nutrition plan",
    "calorieTarget": "Daily calorie target",
    "macroBreakdown": {
      "protein": "X grams",
      "carbohydrates": "X grams", 
      "fats": "X grams"
    },
    "mealPlan": {
      "breakfast": {
        "meal": "Meal description",
        "calories": 400,
        "protein": "20g",
        "carbs": "50g",
        "fats": "15g"
      },
      "lunch": {
        "meal": "Meal description", 
        "calories": 500,
        "protein": "30g",
        "carbs": "60g",
        "fats": "18g"
      },
      "dinner": {
        "meal": "Meal description",
        "calories": 450,
        "protein": "25g", 
        "carbs": "40g",
        "fats": "20g"
      },
      "snacks": [
        {
          "snack": "Snack description",
          "calories": 200,
          "timing": "Between meals"
        }
      ]
    },
    "hydrationGoal": "Daily water intake recommendation",
    "supplementRecommendations": ["Optional supplement suggestions"],
    "nutritionTips": ["Important nutrition guidelines"]
  }
}

Make sure the workout plan is appropriate for the user's fitness level and takes into account any injuries or limitations. The diet plan should align with their fitness goals and respect any dietary restrictions mentioned.

Provide specific, actionable advice that the user can follow immediately.
At the end of your response, ONLY output valid JSON. DO NOT HALUCINATE AND ADD ANYTHING OUTSIDE THE JSON FORMAT
Do not include any explanations or text outside of the JSON object.
`

    console.log('🤖 Sending request to Gemini AI...')

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Parse AI response
    let parsedProgram
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
      parsedProgram = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON:', parseError)
      console.log('🔍 Raw AI Response:', text)
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          rawResponse: text.substring(0, 500), // First 500 chars for debugging
        },
        { status: 500 },
      )
    }

    // Save fitness program to database
    const fitnessProgram = await payload.create({
      collection: 'fitness-programs',
      data: {
        user: email,
        userDetails: {
          name: name,
          age: age ? parseInt(age) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          height: height || undefined,
          fitnessGoals: fitness_goal || undefined,
          injuries: injuries || undefined,
          fitnessLevel: fitness_level || undefined,
          workoutDaysPerWeek: workout_days ? parseInt(workout_days) : undefined,
          dietaryRestrictions: dietary_restrictions || undefined,
        },
        workoutPlan: parsedProgram.workoutPlan,
        dietPlan: parsedProgram.dietPlan,
        generatedAt: new Date(),
        status: 'active',
      },
    } as any)

    console.log('✅ Successfully saved fitness program:', fitnessProgram.id)

    // Generate PDF and send email
    console.log('📄 Generating PDF for email...')
    try {
      // Split the name for firstName and lastName
      const nameParts = name.split(' ')
      const firstName = nameParts[0] || name
      const lastName = nameParts.slice(1).join(' ') || ''

      const userInfo = {
        firstName,
        lastName,
        email,
      }

      // Create program object compatible with PDF generator
      const programForPDF = {
        id: fitnessProgram.id,
        workoutPlan: parsedProgram.workoutPlan,
        dietPlan: parsedProgram.dietPlan,
        generatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      // Generate PDF as buffer data
      const pdfBuffer = await generatePDFForEmail(programForPDF, userInfo)

      if (!pdfBuffer) {
        console.error('❌ Failed to generate PDF for email')
        // Send email without PDF
        const htmlContent = generateEmailHTMLContent(programForPDF, userInfo)
        await sendProgramEmail(userInfo, htmlContent, null)
      } else {
        console.log('📧 Sending email with PDF attachment...')
        // Generate email HTML content
        const htmlContent = generateEmailHTMLContent(programForPDF, userInfo)
        // Send email with PDF attachment
        await sendProgramEmail(userInfo, htmlContent, pdfBuffer)
        console.log('✅ Email sent successfully with PDF attachment')
      }
    } catch (emailError) {
      console.error('❌ Error generating PDF or sending email:', emailError)
      // Continue execution - don't fail the entire request if email fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Fitness program generated successfully for ${name}. Check your email for the PDF!`,
      programId: fitnessProgram.id,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Error generating program:', error)
    return NextResponse.json({ error: 'Failed to generate program' }, { status: 500 })
  }
}

// Generate PDF using Puppeteer with @sparticuz/chromium
// ...existing code...

// Generate PDF using Puppeteer with @sparticuz/chromium
// ...existing code...

// Generate PDF using Puppeteer with @sparticuz/chromium
async function generatePDFForEmail(
  program: any,
  userInfo: { firstName: string; lastName: string; email: string },
): Promise<Buffer | null> {
  let browser
  try {
    console.log('🎭 Starting PDF generation with Puppeteer...')
    console.log('🔍 Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      isProduction: process.env.NODE_ENV === 'production',
    })

    // Use @sparticuz/chromium for production (Vercel) and regular puppeteer for local development
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Launching browser with @sparticuz/chromium for production...')
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true, // Explicitly set to true for production
        defaultViewport: null,
      })
    } else {
      console.log('🚀 Launching browser with local Chrome for development...')
      // For local development, try to find Chrome installation
      const executablePath =
        process.env.CHROME_EXECUTABLE_PATH ||
        '/usr/bin/google-chrome-stable' || // Linux
        '/usr/bin/chromium-browser' || // Linux alternative
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' || // macOS
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // Windows

      browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
        ],
        defaultViewport: null,
      })
    }

    console.log('✅ Browser launched successfully')

    const page = await browser.newPage()

    // Set a specific viewport for PDF generation
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 1,
    })

    console.log('📄 New page created')

    // Generate HTML content for PDF
    console.log('🔄 Generating HTML content...')
    const htmlContent = generatePDFHTMLContent(program, userInfo)
    console.log('✅ HTML content generated, length:', htmlContent.length)

    console.log('📝 Setting page content...')
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })
    console.log('✅ Page content set successfully')

    // Generate PDF buffer
    console.log('📄 Generating PDF...')
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      timeout: 30000,
    })

    console.log('✅ PDF generated successfully')
    console.log('📊 PDF stats:', {
      size: pdfBuffer.length,
      sizeKB: Math.round(pdfBuffer.length / 1024),
      type: typeof pdfBuffer,
      isBuffer: Buffer.isBuffer(pdfBuffer),
    })

    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('❌ Error generating PDF:', error)

    if (error instanceof Error) {
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500),
      })
    }

    return null
  } finally {
    if (browser) {
      try {
        console.log('🔄 Closing browser...')
        await browser.close()
        console.log('✅ Browser closed successfully')
      } catch (closeError) {
        console.error('❌ Error closing browser:', closeError)
      }
    }
  }
}

// ...existing code...

// ...existing code...

// Generate comprehensive HTML content for PDF
function generatePDFHTMLContent(
  program: any,
  userInfo: { firstName: string; lastName: string; email: string },
): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const workoutPlan = program.workoutPlan || {}
  const dietPlan = program.dietPlan || {}

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MaxFit AI - Personal Fitness Program</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 32px;
          margin-bottom: 10px;
        }
        
        .header p {
          font-size: 18px;
          opacity: 0.9;
        }
        
        .user-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section h2 {
          color: #4f46e5;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .section h3 {
          color: #16a34a;
          margin: 20px 0 10px 0;
        }
        
        .workout-day {
          background: #f8f9ff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .exercise {
          background: white;
          padding: 15px;
          border-left: 4px solid #4f46e5;
          margin-bottom: 15px;
        }
        
        .meal {
          background: #f0fdf4;
          padding: 15px;
          border-left: 4px solid #16a34a;
          margin-bottom: 15px;
        }
        
        .macro-info {
          display: flex;
          gap: 20px;
          margin-top: 10px;
        }
        
        .macro {
          background: #e0f2fe;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .tips {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        
        ul {
          margin-left: 20px;
        }
        
        li {
          margin-bottom: 5px;
        }
        
        @page {
          margin: 20mm;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏋️ Your Personal Fitness Program</h1>
          <p>Generated by MaxFit AI</p>
        </div>
        
        <div class="user-info">
          <h3>Program Details</h3>
          <p><strong>Name:</strong> ${userInfo.firstName} ${userInfo.lastName}</p>
          <p><strong>Generated:</strong> ${formatDate(program.generatedAt)}</p>
          <p><strong>Program ID:</strong> ${program.id}</p>
        </div>
        
        <div class="section">
          <h2>🏋️ Workout Plan</h2>
          <p>${workoutPlan.overview || 'Your personalized workout plan'}</p>
          
          <div class="tips">
            <strong>Program Overview:</strong>
            <ul>
              <li><strong>Duration:</strong> ${workoutPlan.duration || 'Ongoing'}</li>
              <li><strong>Frequency:</strong> ${workoutPlan.frequency || 'As specified'}</li>
            </ul>
          </div>
          
          ${
            workoutPlan.weeklySchedule
              ? workoutPlan.weeklySchedule
                  .map(
                    (day: any) => `
            <div class="workout-day">
              <h3>${day.day} - ${day.workoutType}</h3>
              <p><strong>Duration:</strong> ${day.duration || '45-60 minutes'}</p>
              
              ${
                day.exercises
                  ? day.exercises
                      .map(
                        (exercise: any) => `
                <div class="exercise">
                  <h4>${exercise.name}</h4>
                  <p><strong>Sets:</strong> ${exercise.sets} | <strong>Reps:</strong> ${exercise.reps} | <strong>Weight:</strong> ${exercise.weight}</p>
                  <p><strong>Rest:</strong> ${exercise.restTime}</p>
                  ${exercise.notes ? `<p><em>Notes: ${exercise.notes}</em></p>` : ''}
                </div>
              `,
                      )
                      .join('')
                  : '<p>Exercises will be detailed based on your specific goals.</p>'
              }
            </div>
          `,
                  )
                  .join('')
              : '<p>Your weekly schedule will be customized based on your preferences.</p>'
          }
          
          ${
            workoutPlan.progressionNotes
              ? `
            <div class="tips">
              <h4>Progression Notes</h4>
              <p>${workoutPlan.progressionNotes}</p>
            </div>
          `
              : ''
          }
          
          ${
            workoutPlan.safetyTips && workoutPlan.safetyTips.length > 0
              ? `
            <div class="tips">
              <h4>Safety Tips</h4>
              <ul>
                ${workoutPlan.safetyTips.map((tip: string) => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }
        </div>
        
        <div class="section">
          <h2>🥗 Nutrition Plan</h2>
          <p>${dietPlan.overview || 'Your personalized nutrition plan'}</p>
          
          <div class="tips">
            <strong>Daily Targets:</strong>
            <ul>
              <li><strong>Calories:</strong> ${dietPlan.calorieTarget || 'Calculated for your goals'}</li>
              <li><strong>Hydration:</strong> ${dietPlan.hydrationGoal || '8-10 glasses of water per day'}</li>
            </ul>
          </div>
          
          ${
            dietPlan.macroBreakdown
              ? `
            <div class="tips">
              <h4>Macro Breakdown</h4>
              <div class="macro-info">
                <div class="macro">Protein: ${dietPlan.macroBreakdown.protein}</div>
                <div class="macro">Carbs: ${dietPlan.macroBreakdown.carbohydrates}</div>
                <div class="macro">Fats: ${dietPlan.macroBreakdown.fats}</div>
              </div>
            </div>
          `
              : ''
          }
          
          ${
            dietPlan.mealPlan
              ? `
            <h3>Daily Meal Plan</h3>
            
            ${
              dietPlan.mealPlan.breakfast
                ? `
              <div class="meal">
                <h4>🌅 Breakfast</h4>
                <p>${dietPlan.mealPlan.breakfast.meal}</p>
                <div class="macro-info">
                  <div class="macro">Calories: ${dietPlan.mealPlan.breakfast.calories}</div>
                  <div class="macro">Protein: ${dietPlan.mealPlan.breakfast.protein}</div>
                  <div class="macro">Carbs: ${dietPlan.mealPlan.breakfast.carbs}</div>
                  <div class="macro">Fats: ${dietPlan.mealPlan.breakfast.fats}</div>
                </div>
              </div>
            `
                : ''
            }
            
            ${
              dietPlan.mealPlan.lunch
                ? `
              <div class="meal">
                <h4>🌞 Lunch</h4>
                <p>${dietPlan.mealPlan.lunch.meal}</p>
                <div class="macro-info">
                  <div class="macro">Calories: ${dietPlan.mealPlan.lunch.calories}</div>
                  <div class="macro">Protein: ${dietPlan.mealPlan.lunch.protein}</div>
                  <div class="macro">Carbs: ${dietPlan.mealPlan.lunch.carbs}</div>
                  <div class="macro">Fats: ${dietPlan.mealPlan.lunch.fats}</div>
                </div>
              </div>
            `
                : ''
            }
            
            ${
              dietPlan.mealPlan.dinner
                ? `
              <div class="meal">
                <h4>🌙 Dinner</h4>
                <p>${dietPlan.mealPlan.dinner.meal}</p>
                <div class="macro-info">
                  <div class="macro">Calories: ${dietPlan.mealPlan.dinner.calories}</div>
                  <div class="macro">Protein: ${dietPlan.mealPlan.dinner.protein}</div>
                  <div class="macro">Carbs: ${dietPlan.mealPlan.dinner.carbs}</div>
                  <div class="macro">Fats: ${dietPlan.mealPlan.dinner.fats}</div>
                </div>
              </div>
            `
                : ''
            }
            
            ${
              dietPlan.mealPlan.snacks && dietPlan.mealPlan.snacks.length > 0
                ? `
              <h4>🍎 Snacks</h4>
              ${dietPlan.mealPlan.snacks
                .map(
                  (snack: any) => `
                <div class="meal">
                  <p>${snack.snack}</p>
                  <div class="macro-info">
                    <div class="macro">Calories: ${snack.calories}</div>
                    <div class="macro">Timing: ${snack.timing}</div>
                  </div>
                </div>
              `,
                )
                .join('')}
            `
                : ''
            }
          `
              : ''
          }
          
          ${
            dietPlan.supplementRecommendations && dietPlan.supplementRecommendations.length > 0
              ? `
            <div class="tips">
              <h4>Supplement Recommendations</h4>
              <ul>
                ${dietPlan.supplementRecommendations.map((supplement: string) => `<li>${supplement}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }
          
          ${
            dietPlan.nutritionTips && dietPlan.nutritionTips.length > 0
              ? `
            <div class="tips">
              <h4>Nutrition Tips</h4>
              <ul>
                ${dietPlan.nutritionTips.map((tip: string) => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }
        </div>
        
        <div class="footer">
          <p>💪 Start your fitness journey today with MaxFit AI!</p>
          <p>Questions? Contact us at support@maxfitai.com</p>
          <p>Generated on ${formatDate(program.generatedAt)}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate simple HTML content for email body (separate from PDF)
function generateEmailHTMLContent(
  program: any,
  userInfo: { firstName: string; lastName: string; email: string },
): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🏋️ Your Personal Fitness Program</h1>
        <p style="margin: 10px 0 0; font-size: 18px;">Generated by MaxFit AI</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Hello ${userInfo.firstName}! 👋</h2>
        <p style="color: #666; line-height: 1.6;">
          Your personalized fitness and nutrition program is ready! This comprehensive plan has been tailored specifically for your goals and preferences.
        </p>
        
        <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4f46e5; margin-top: 0;">📎 What's Attached</h3>
          <p style="color: #666;">Your complete fitness program PDF includes:</p>
          <ul style="color: #666;">
            <li>✅ Detailed workout plan with exercises</li>
            <li>✅ Complete nutrition guide with meals</li>
            <li>✅ Progression notes and safety tips</li>
            <li>✅ Macro breakdowns and meal timing</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666;">📱 <strong>Access your program online anytime:</strong></p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://maxfit-ai.vercel.app'}/" 
             style="display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Dashboard →
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center; color: #999; font-size: 14px;">
          <p>Generated on ${formatDate(program.generatedAt)}</p>
          <p>💪 Start your fitness journey today with MaxFit AI!</p>
          <p>Questions? Reply to this email and we'll help you out.</p>
        </div>
      </div>
    </div>
  `
}

// Send email with program and PDF attachment
async function sendProgramEmail(
  userInfo: { firstName: string; lastName: string; email: string },
  htmlContent: string,
  pdfBuffer: Buffer | null,
): Promise<void> {
  try {
    console.log('📧 Sending email using nodemailer transporter...')
    console.log('📧 Email recipient:', userInfo.email)
    console.log('📧 PDF attachment:', pdfBuffer ? `${pdfBuffer.length} bytes` : 'No PDF')

    const mailOptions: any = {
      from: process.env.SMTP_FROM || 'noreply@maxfitai.com',
      to: userInfo.email,
      subject: `🏋️ Your Personal Fitness Program is Ready, ${userInfo.firstName}!`,
      html: htmlContent,
    }

    // Add PDF attachment if available
    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: `MaxFit-AI-Program-${userInfo.firstName}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ]
    }

    console.log('📧 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: htmlContent.length,
      hasAttachment: !!pdfBuffer,
    })

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', info.messageId)
    console.log('📧 Email response:', info.response)
  } catch (error) {
    console.error('❌ Error sending program email:', error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
    }

    throw error
  }
}
