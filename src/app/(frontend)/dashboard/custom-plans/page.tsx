import { RequirePlanAccess } from '../../lib/RequirePlanAccess'

export default function CustomPlansPage() {
  return (
    <RequirePlanAccess>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Custom Plans</h1>
        <p className="text-gray-700">
          This is the Custom Plans page where you can create and manage your personalized plans.
        </p>
      </div>
    </RequirePlanAccess>
  )
}
