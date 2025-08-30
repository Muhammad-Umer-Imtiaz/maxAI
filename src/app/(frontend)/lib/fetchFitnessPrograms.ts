export async function fetchUserFitnessPrograms(userEmail: string) {
  try {
    const response = await fetch(`/api/fitness-programs?user=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch fitness programs')
    }

    const data = await response.json()
    return data.docs || []
  } catch (error) {
    console.error('Error fetching fitness programs:', error)
    return []
  }
}
